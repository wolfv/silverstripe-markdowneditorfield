<?php

class MarkdownField extends TextareaField {
	protected $template = 'MarkdownField';

	function Field($properties = array()) {
		Requirements::javascript(THIRDPARTY_DIR . '/jquery/jquery.js');
		Requirements::javascript('markdown/javascript/showdown.js');
		Requirements::javascript('markdown/javascript/md.js');
		Requirements::css('themes/dew/css/typography.css');
		Requirements::css('markdown/css/md.css');

		if($this->disabled) $attributes['disabled'] = 'disabled';
		$properties["class"] = "markdown_Input";
		$properties["LinkSuggest"] = $this->Link() . '/linksuggest';
		$properties["ImageSuggest"] = $this->Link() . '/imagesuggest';
		$properties["FindLink"] = $this->Link() . '/getlinktoid';
		$obj = ($properties) ? $this->customise($properties) : $this;
		return $obj->renderWith($this->getTemplate());
	}

	function linksuggest() {
		$search = $this->request["search"];
		$data = DataList::create('SiteTree')->filter(array("Title:StartsWith" => $search));
		$data_array = $data->toNestedArray();

		return json_encode($data_array);
	}

	function getlinktoid() {
		$id = $this->request["ID"];
		$data = DataList::create('SiteTree')->byID($id);

		return $data->Link();
	}

	/**
	 * Return a {@link Form} instance allowing a user to
	 * add links in the TinyMCE content editor.
	 *
	 * @return Form
	 */
	function LinkForm() {
		$siteTree = new TreeDropdownField('internal', _t('HtmlEditorField.PAGE', "Page"), 'SiteTree', 'ID', 'MenuTitle', true);
		// mimic the SiteTree::getMenuTitle(), which is bypassed when the search is performed
		$siteTree->setSearchFunction(array($this, 'siteTreeSearchCallback'));

		$numericLabelTmpl = '<span class="step-label"><span class="flyout">%d</span><span class="arrow"></span><strong class="title">%s</strong></span>';
		$form = new Form(
			$this->controller,
			"{$this->name}/LinkForm",
			new FieldList(
				new LiteralField(
					'Heading',
					sprintf('<h3>%s</h3>', _t('HtmlEditorField.LINK', 'Link'))
				),
				$contentComposite = new CompositeField(
					new OptionsetField(
						'LinkType',
						sprintf($numericLabelTmpl, '1', _t('HtmlEditorField.LINKTO', 'Link to')),
						array(
							'internal' => _t('HtmlEditorField.LINKINTERNAL', 'Page on the site'),
							'external' => _t('HtmlEditorField.LINKEXTERNAL', 'Another website'),
							'anchor' => _t('HtmlEditorField.LINKANCHOR', 'Anchor on this page'),
							'email' => _t('HtmlEditorField.LINKEMAIL', 'Email address'),
							'file' => _t('HtmlEditorField.LINKFILE', 'Download a file'),
						)
					),
					new LiteralField('Step2',
						'<div class="step2">' . sprintf($numericLabelTmpl, '2', _t('HtmlEditorField.DETAILS', 'Details')) . '</div>'
					),
					$siteTree,
					new TextField('external', _t('HtmlEditorField.URL', 'URL'), 'http://'),
					new EmailField('email', _t('HtmlEditorField.EMAIL', 'Email address')),
					new TreeDropdownField('file', _t('HtmlEditorField.FILE', 'File'), 'File', 'Filename', 'Title', true),
					new TextField('Anchor', _t('HtmlEditorField.ANCHORVALUE', 'Anchor')),
					new TextField('Description', _t('HtmlEditorField.LINKDESCR', 'Link description')),
					new CheckboxField('TargetBlank', _t('HtmlEditorField.LINKOPENNEWWIN', 'Open link in a new window?')),
					new HiddenField('Locale', null, $this->controller->Locale)
				)
			),
			new FieldList(
				$removeAction = new ResetFormAction('remove', _t('HtmlEditorField.BUTTONREMOVELINK', 'Remove link')),
				$insertAction = new FormAction('insert', _t('HtmlEditorField.BUTTONINSERTLINK', 'Insert link'))
			)
		);

		$insertAction->addExtraClass('ss-ui-action-constructive');
		$removeAction->addExtraClass('ss-ui-action-destructive');
		$contentComposite->addExtraClass('content');

		$form->unsetValidator();
		$form->loadDataFrom($this);
		$form->addExtraClass('htmleditorfield-form htmleditorfield-linkform cms-dialog-content');

		$this->extend('updateLinkForm', $form);

		return $form;
	}

	/**
	 * Return a {@link Form} instance allowing a user to
	 * add images to the TinyMCE content editor.
	 *
	 * @return Form
	 */
	function ImageForm() {
		if(!class_exists('ThumbnailStripField')) {
			throw new Exception('ThumbnailStripField class required for HtmlEditorField->ImageForm()');
		}

		$fields = new FieldList(
			new LiteralField(
				'Heading',
				sprintf('<h3>%s</h3>', _t('HtmlEditorField.IMAGE', 'Image'))
			),

			$contentComposite = new CompositeField(
				new TreeDropdownField('FolderID', _t('HtmlEditorField.FOLDER', 'Folder'), 'Folder'),
				new CompositeField(new FieldList(
					new LiteralField('ShowUpload', '<p class="showUploadField"><a href="#">'. _t('HtmlEditorField.SHOWUPLOADFORM', 'Upload File') .'</a></p>'),
					new FileField("Files[0]" , _t('AssetAdmin.CHOOSEFILE','Choose file: ')),
						new LiteralField('Response', '<div id="UploadFormResponse"></div>'),
						new HiddenField('UploadMode', 'Upload Mode', 'CMSEditor') // used as a hook for doUpload switching
				)),
				new TextField('getimagesSearch', _t('HtmlEditorField.SEARCHFILENAME', 'Search by file name')),
				new ThumbnailStripField('FolderImages', 'FolderID', 'getimages'),
				new TextField('AltText', _t('HtmlEditorField.IMAGEALTTEXT', 'Alternative text (alt) - shown if image cannot be displayed'), '', 80),
				new TextField('ImageTitle', _t('HtmlEditorField.IMAGETITLE', 'Title text (tooltip) - for additional information about the image')),
				new TextField('CaptionText', _t('HtmlEditorField.CAPTIONTEXT', 'Caption text')),
				new DropdownField(
					'CSSClass',
					_t('HtmlEditorField.CSSCLASS', 'Alignment / style'),
					array(
						'left' => _t('HtmlEditorField.CSSCLASSLEFT', 'On the left, with text wrapping around.'),
						'leftAlone' => _t('HtmlEditorField.CSSCLASSLEFTALONE', 'On the left, on its own.'),
						'right' => _t('HtmlEditorField.CSSCLASSRIGHT', 'On the right, with text wrapping around.'),
						'center' => _t('HtmlEditorField.CSSCLASSCENTER', 'Centered, on its own.'),
					)
				),
				new FieldGroup(_t('HtmlEditorField.IMAGEDIMENSIONS', 'Dimensions'),
					new TextField('Width', _t('HtmlEditorField.IMAGEWIDTHPX', 'Width'), 100),
					new TextField('Height', " x " . _t('HtmlEditorField.IMAGEHEIGHTPX', 'Height'), 100)
				)
			)
		);

		$actions = new FieldList(
			$insertAction = new FormAction('insertimage', _t('HtmlEditorField.BUTTONINSERTIMAGE', 'Insert image'))
		);
		$insertAction->addExtraClass('ss-ui-action-constructive');

		$form = new Form(
			$this->controller,
			"{$this->name}/ImageForm",
			$fields,
			$actions
		);

		$contentComposite->addExtraClass('content');

		// Allow other people to extend the fields being added to the imageform
		$this->extend('updateImageForm', $form);

		$form->unsetValidator();
		$form->disableSecurityToken();
		$form->loadDataFrom($this);
		$form->addExtraClass('htmleditorfield-form htmleditorfield-imageform cms-dialog-content');

		return $form;
	}
}

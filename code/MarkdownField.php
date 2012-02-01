<?php

class MarkdownField extends TextareaField {
	protected $template = 'MarkdownField';
	static $editortheme = 'twilight';
	function Field($properties = array()) {
		Requirements::javascript(THIRDPARTY_DIR . '/jquery/jquery.js');
		Requirements::javascript('markdown/javascript/markdownField.js');
		Requirements::css('markdown/css/md.css');

		if($this->disabled) $attributes['disabled'] = 'disabled';
		$properties["class"] = "markdown_Input";

		$properties["LinkSuggest"] = $this->Link() . '/linksuggest';
		$properties["ImageSuggest"] = $this->Link() . '/imagesuggest';
		$properties["FindLink"] = $this->Link() . '/getlinktoid';

		$properties["Editor"] = $this->Link() . '/getEditor';

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

	function imagesuggest() {
		$search = $this->request["search"];
		$data = DataList::create('File')->filter(array("Title:PartialMatch" => $search));
		$data_array = $data->toNestedArray();
		return json_encode($data_array);
	}

	function getimagelinktoid() {
		$id = $this->request["ID"];
		$data = DataList::create('File')->byID($id);
		return $data->Link();
	}

	public function getEditor() {
		Requirements::clear();
		Requirements::javascript(THIRDPARTY_DIR . '/jquery/jquery.js');
		Requirements::javascript(THIRDPARTY_DIR . '/jquery-ui/jquery-ui.js');
		Requirements::javascript(THIRDPARTY_DIR. '/jquery-entwine/dist/jquery.entwine-dist.js');
		Requirements::javascript('markdown/javascript/lib/showdown.js');
		Requirements::javascript('markdown/javascript/lib/ace/src/ace.js');
		Requirements::javascript('markdown/javascript/lib/ace/src/mode-markdown.js');
		Requirements::javascript('markdown/javascript/lib/ace/src/theme-' . self::$editortheme . '.js');
		Requirements::javascript('markdown/javascript/markdownEditor.js');
		Requirements::themedCSS('typography');
		Requirements::css('markdown/css/md.css');
		//Requirements::css(THIRDPARTY_DIR . '/jquery-ui-themes/smoothness/jquery-ui.css');

		$properties["LinkSuggest"] = 'linksuggest';
		$properties["ImageSuggest"] = 'imagesuggest';
		$properties["FindLink"] = 'getlinktoid';
		$properties["FindImageLink"] = 'getimagelinktoid';

		return $this->customise($properties)->renderWith('MarkdownEditor');
	}
}

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

}

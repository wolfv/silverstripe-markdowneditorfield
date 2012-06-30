<?php

require_once('lib/markdown/markdown.php');
require_once('lib/markdown/markdown_extended.php');

class MarkdownParser extends TextParser {
	function parse() {
		$text = MarkdownExtended($this->content);
		return $text;
	}
}

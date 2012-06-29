<?php

require_once('lib/markdown/markdown.php');
require_once('lib/markdown/markdown_extended.php');
require_once('lib/phphyphenator/hyphenation.php');

class MarkdownParser extends TextParser {
	function parse() {
		$text = MarkdownExtended($this->content);
		return $text;
	}
}

<?php

require_once('lib/markdown.php');

class MarkdownParser extends TextParser {
	function parse() {

		return Markdown($this->content);
	}
}

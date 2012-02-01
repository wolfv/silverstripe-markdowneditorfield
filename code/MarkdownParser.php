<?php

require_once('lib/markdown/markdown.php');


class MarkdownParser extends TextParser {
	function parse() {
		$text = Markdown($this->content);

		include('lib/phphyphenator/hyphenation.php');
		return hyphenation($text);
	}
}

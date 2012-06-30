# Silverstripe 3.0 MarkdownEditor Field

Requires Silverstripe 3.0 and a modern browser.

A simple, yet versatile field for nice textediting in the Silverstripe CMS. It's based on the ACE Editor.

Features:

Suggest Link: `[Testlink](:` leads to an autosuggest-field.
Suggest Image: `![Image Description](!` opens an image-autosuggest field.

Getting the markdown editor field as a replacement for TinyMCE is easy:
```php
public function getCMSFields() {
		$fields = parent::getCMSFields();
		$md = new MarkdownField('Content', 'Content');
		$md->addExtraClass('stacked'); // Little different Layout in CMS
		$fields->addFieldToTab('Root.Main', $md);
		return $fields;
}
```
To use the Markdown-Formatted Content on the website, use e.g. instead of `$Content` `$Content.Parse(MarkdownParser)`.

To get the same Syntax Highlighting as in the preview pane inside the Editor, include `markdown/javascript/lib/highlight/src/highlight.pack.js` to your template. Initialization could look like this (with jQuery):
```javascript
$(document).ready(function() {
  $('pre code').each(function(i, e) {hljs.highlightBlock(e)});
});
```

More examples are on [http://softwaremaniacs.org/soft/highlight/en/description/](http://softwaremaniacs.org/soft/highlight/en/description/) (All credit to them)



---
The Markdown Logo was made by Dustin Curtis. All other icons were made by Orman Clark [Premium Pixels](http://www.premiumpixels.com)

/*window.onload = function() {
		window.editor = ace.edit("markdown_Editor");
		//editor.setTheme("ace/theme/tomorrow");
    var MarkdownMode = require("ace/mode/markdown").Mode;
		window.editor.getSession().setUseWrapMode(true);
		window.editor.getSession().setValue($('#markdown_Value').text());
		window.editor.getSession().setMode(new MarkdownMode());
}

function getContents() {
	return window.editor.getSession().getValue();
}*/

/*

        var cursor = this.getCursorPosition();
        this.insert("\n");
        this.moveCursorToPosition(cursor);


*/
$('#markdown_Editor').entwine({
	Editor: null,
	AutoCompleteBuffer: null,
	onmatch: function() {
		window.editor = ace.edit(this[0]);

		this.setEditor(window.editor);

		var MarkdownMode = require("ace/mode/markdown").Mode;
		this.getEditor().getSession().setUseWrapMode(true);
		this.getEditor().getSession().setValue($('#markdown_Value').text());
		this.getEditor().getSession().setMode(new MarkdownMode());
		self = this;
		this.getEditor().on('change', function(arg, ev) {self.editorChange(arg, ev);});

	},
	editorChange: function(arg) {
		if(arg.data.text == ':' || arg.data.text == '!') {
			var e = this.getEditor();
			var	r = e.getSelectionRange();
			var s = e.session.getTokenAt(r.end.row);
			if(s.value.substring(s.value.length, s.value.length - 3) == '](:') {
				$('#markdown_SiteTreeAutocomplete').activate();
			}
			else if(s.value.substring(s.value.length, s.value.length - 3) == '](!') {
				$('#markdown_ImageAutocomplete').activate();
			}
		}
	},
	editorContent: function() {
		return this.getEditor().getSession().getValue();
	},
	insertText: function(text, clearBefore) {
		this.getEditor().insert(text);
		this.getEditor().remove();
		this.getEditor().focus();
	},
	focusEditor: function() {
		this.getEditor().focus();
	},
	test: function() {
		var ed = this.getEditor();

    if (ed.selection.isEmpty()) {
			ed.insert('test');
			ed.navigateLeft(2);
    }
		else {
	    var originalRange = ed.getSelectionRange();
    	var range = ed.getSelectionRange();
   		var text = ed.session.getTextRange(range);
    	ed.session.replace(range, '*test*');
    	ed.selection.setSelectionRange(originalRange + 2);
		}
		ed.focus();
	}
});

$('#markdown_PreviewContent').entwine({
	Timer: null,
	Converter: null,
	Editor: null,
	Open: true,
	onmatch: function() {
		this.setEditor($('#markdown_Editor'));
		this.setConverter(new Showdown.converter());
		//this.startWatching();
	},
	close: function() {
		this.parent().css('opacity', 0);
		//this.stopWatching();
		this.setOpen(false);
	},
	open: function() {
		this.parent().css('opacity', 1);
		//this.startWatching();
		this.setOpen(true);
	},
	refresh: function() {
		this.html(this.getConverter().makeHtml(this.getEditor().editorContent()));
	},
	reload: function() {
		self = this;
		$.post(
			"getconvertedhtml",{ text : self.getEditor().editorContent() },
			function(data) {
				self.html(data);
			}
		);
		return;
	},
	startWatching: function() {
		var self = this;
		Timer = setInterval(function() {
			self.refresh();
		}, 1000);
	},
	stopWatching: function() {
		clearInterval(this.getTimer());
	}
});

$('#markdown_PreviewButton').entwine({
	onclick: function() {
		$('#markdown_PreviewContent').reload();
		/*if($('#markdown_PreviewContent').getOpen())
			$('#markdown_PreviewContent').close();
		else
			$('#markdown_PreviewContent').open();
		*/
	}
});
$('.markdown_italic').entwine({
	onclick: function() {
		$('#markdown_Editor').test();
	}
});

$('#markdown_SiteTreeAutocomplete').entwine({
		onmatch: function() {
			var linksuggest = $(this).attr('linksuggest');
			this.autocomplete({
				source: function( request, response ) {
					$.ajax({
						url: linksuggest,
						dataType: "json",
						data: {
							search: request.term
						},
						success: function( data ) {
							response( $.map( data, function( item ) {
								return {
									label: item.Title,
									value: item.ID
								}
							}));
						},
						error: function(data) {
							console.log(data);
						}
					});
				},
				minLength: 1,
				select: function( event, ui ) {

				},
				open: function() {
					$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
				},
				close: function() {
					$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
				}
			});
		},
});

$('#markdown_ImageAutocomplete').entwine({
		onmatch: function() {
			var linksuggest = $(this).attr('linksuggest');
			this.autocomplete({
				html: true,
				source: function( request, response ) {
					$.ajax({
						url: linksuggest,
						dataType: "json",
						data: {
							search: request.term
						},
						success: function( data ) {
							response( $.map( data, function( item ) {
								return {
									label: '<img src='+item.ImageLink + '>' + item.Label,
									value: item.ID
								}
							}));
							return result(responseArray);
						},
						error: function(data) {
							console.log(data);
						}
					});
				},
				minLength: 1,
				select: function( event, ui ) {

				},
				open: function() {
					$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
				},
				close: function() {
					$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
				}
			})
		},

});

$('.autocomplete').entwine({
		activate: function() {
			var pos = $('.ace_cursor').first().position();
			this.appendTo('.ace_content').css({top: pos.top, left: pos.left + 5}).show().focus();
			this.val('');
		},
		onblur: function() {
			this.deactivate();
		},
		deactivate: function() {
			this.css('display', 'none');
			$('#markdown_Editor').focusEditor();
		},
		onkeydown: function(e) {
			if(e.keyCode == 9 || e.keyCode == 13 || e.keyCode == 27) {
				e.preventDefault();
				$.get(this.attr('findlink'), {ID: $(this).val()}, function(data) {
					$('#markdown_Editor').insertText(data + ')', 1);
				});
				this.deactivate();
			}
		}
});

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
window.autocomplete = null;

(function($) {

	$.entwine('ss', function($){

		$('#markdown_Editor').entwine({
			Editor: null,
			AutoCompleteBuffer: null,
			onmatch: function() {
				var editor = window.editor = ace.edit(this[0]);

				this.setEditor(window.editor);

				var MarkdownMode = require("ace/mode/markdown").Mode;
				editor.getSession().setUseWrapMode(true);
				editor.getSession().setValue($('#markdown_Value').text());
				editor.getSession().setMode(new MarkdownMode());
				self = this;
				editor.on('change', function(arg, ev) {
					self.editorChange(arg);
				})
			},
			editorChange: function(arg) {
				if(arg.data.text == ':' || arg.data.text == '!') {
					var e = this.getEditor();
					var	r = e.getSelectionRange();
					var s = e.session.getTokenAt(r.end.row);
					if(s.value.substring(s.value.length, s.value.length - 3) == '](:') {
						$('#markdown_SiteTreeAutocomplete').activate();
						window.autocomplete = "sitetree";
					}
					else if(s.value.substring(s.value.length, s.value.length - 3) == '](!') {
						$('#markdown_ImageAutocomplete').activate();
						window.autocomplete = "image"
					}
				}
			},
			editorContent: function() {
				return this.getEditor().getSession().getValue();
			},
			insertText: function(text, clearBefore) {
				this.getEditor().remove('left');
				this.getEditor().insert(text);
				//this.getEditor().focus();
			},
			focusEditor: function() {
				this.getEditor().focus();
			},
			blurEditor: function() {
				this.getEditor().blur()
			}
		});

		$('#markdown_PreviewContent').entwine({
			Timer: null,
			Converter: null,
			Editor: null,
			Open: false,
			onmatch: function() {
				this.setEditor($('#markdown_Editor'));
				this.setConverter(new Showdown.converter());
				this.bind('forceReload', function() {
					console.log('at least.')
				});
			},
			close: function() {
				this.parent().css('opacity', 0);
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
				console.log('was called')
				if(!this.getOpen()) {
					if($(document).width() < 500) {
						this.parent().animate({ left : '490px', opacity: 1, zIndex: 200}, 500);
					}
					this.parent().animate({ left : '490px', opacity: 1}, 500);
					this.setOpen(true);
				}
				else {
					this.animate({opacity: 0},200).addClass('loading');
				}
				$.post(
					"getconvertedhtml",{ text : self.getEditor().editorContent() },
					function(data) {
						self.html(data).animate({opacity: 1},200).removeClass('loading');
						self.find('pre').each(function(i, e){
							hljs.highlightBlock(e);
						});
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

		// Proxy Buttons (somehow triggering custom events in the iframe is not working correct).
		$('#markdown_PreviewButton').entwine({
			onclick: function() {
				$('#markdown_PreviewContent').reload();
			}
		});
		$('#markdown_ClosePreviewButton').entwine({
			onclick: function() {
				$('#markdown_PreviewContent').close();
			}
		});

		$('#markdown_SiteTreeAutocomplete').entwine({
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
											label: '<span class="autosuggest_title">' + item.Label + '</span>' +
												   '<span class="autosuggest_breadcrumb">' + item.Breadcrumbs + '</span>',
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
						change: function( event, ui ) {
						},
						open: function() {
							$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
						},
						close: function() {
							$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
						}
					});
				},
				activate: function() {
					this.val('');
					var pos = $('.ace_cursor').first().position();
					this.appendTo('.ace_content').css({top: pos.top, left: pos.left + 5, background: '#CCC', minWidth: '10px'}).show();
				},
				onfocusout: function() {
					//this.deactivate();
				},
				deactivate: function() {
					this.css('display', 'none');
					window.autocomplete = null;
					$('#markdown_Editor').focusEditor();
				},
				onkeydown: function(e) {
					if(e.keyCode == 9 || e.keyCode == 13 || e.keyCode == 27) {
						e.preventDefault();
						$.get(
							$(this).attr('findlink'), 
							{ID: $(this).val()}, 
							function(data) {
								$('#markdown_Editor').insertText(data + ')', 0);
							}
						);
						this.deactivate();
					}
				}
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
											label: '<span class="image_suggest_item">' +
													'<span class="image_suggest_img">' + 
													'<img src=' + item.ImageLink + ' width="40"></span>'+
													'<span class="image_suggest_title">' + item.Label + '</span><span class="x"></span></span>'
													,
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
					})
				},
				activate: function() {
					var pos = $('.ace_cursor').first().position();
					this.appendTo('.ace_content').css({top: pos.top, left: pos.left + 5}).show().focus();
					this.val('');
				},
				deactivate: function() {
					this.css('display', 'none');
					window.autocomplete = null;
					$('#markdown_Editor').focusEditor();
				},
				onkeydown: function(e) {
					if(e.keyCode == 9 || e.keyCode == 13 || e.keyCode == 27) {
						e.preventDefault();
						$.get(
							$(this).attr('findlink'), 
							{ID: $(this).val()}, 
							function(data) {
								$('#markdown_Editor').insertText(data + ')', 1);
							}
						);
						this.deactivate();
					}
				}

		});

	});
	$(document).on('keydown', function(e) {
		if(window.autocomplete != null && window.autocomplete != 'focused') {
			if(window.autocomplete == 'sitetree') {
				$('#markdown_SiteTreeAutocomplete').focus();
			} else {
				$('#markdown_ImageAutocomplete').focus();
			}
			window.autocomplete = 'focused';
		}
	})
})(jQuery)
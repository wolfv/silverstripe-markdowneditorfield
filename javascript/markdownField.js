(function($) {

	$.entwine('ss', function($){

		$('.markdown-editor-iframe').entwine({
			EditorFrame: null,
			onmatch: function() {
				self = this;
				this.setEditorFrame(self[0].contentWindow);
				this.closest('form').bind('beforesave', function() {
					var value = EditorFrame.editor.getSession().getValue();
					self.parent().find('textarea.markdown').val(value);
				});
			}
		});

		$('.markdown-editor-toolbar').entwine({
			Editor: null,
			onmatch: function() {
				this.setEditor(this.parent().find('.markdown-editor-iframe'));
				console.log(this.Editor)
			},
			openLinkDialog: function() {
				this.openDialog('link');
			},
			openMediaDialog: function() {
				this.openDialog('media');
			},
			openDialog: function(type) {
				var capitalize = function(text) {
					return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
				};

				var url = $('#cms-editor-dialogs').data('url' + capitalize(type) + 'form'),
					dialog = $('.htmleditorfield-' + type + 'dialog');

				if(dialog.length) {
					dialog.open();
				} else {
					// Show a placeholder for instant feedback. Will be replaced with actual
					// form dialog once its loaded.
					dialog = $('<div class="htmleditorfield-dialog htmleditorfield-' + type + 'dialog loading">');
					$('body').append(dialog);
					$.ajax({
						url: url,
						success: function(html) {
							dialog.html(html);
							dialog.trigger('dialogopen');
						}
					});
				}
			}

		})
		$('#MDEditorInsertImage').entwine({
			onmatch: function() {

			},
			onclick: function() {
				$('.markdown-editor-toolbar').openMediaDialog();
			}
		});
		$('#MDEditorInsertLink').entwine({
			onclick: function() {
				$('.markdown-editor-toolbar').openLinkDialog();
			}
		})
		$('#MDEditorHelp').entwine({
			onclick: function() {
				var type = 'MDHELP'
				var dialog = $('.htmleditorfield-' + type + 'dialog');

				if(dialog.length) {
					dialog.open();
				} else {
					// Show a placeholder for instant feedback. Will be replaced with actual
					// form dialog once its loaded.
					dialog = $('<div class="htmleditorfield-dialog htmleditorfield-' + type + 'dialog loading">');
					$('body').append(dialog);
					var url = "https://raw.github.com/gist/976172/70f1e0db278340bd8167c98fb880979b4571e847/gistfile1.md";

					dialog.html($('<iframe>').attr('src', url));
				}
			}
		});
		$('#MDEditorQuickPreview').entwine({
			Open: false,
			onclick: function() {
				var iframe = this.parent().getEditor();
				$(iframe).contents().find('#markdown_PreviewButton').trigger('click');
				this.addClass('md-refresh')
				if(this.getOpen() == false) {
					this.parent().append($('<a>').addClass('md-button md-close').attr('title', 'Close the Preview window.'));
					this.setOpen(true);
				}
			},
			close: function() {
				if(this.getOpen() == true) {
					this.setOpen(false);
					this.parent().find('.md-close').remove()
					var iframe = this.parent().getEditor();
					$(iframe).contents().find('#markdown_ClosePreviewButton').trigger('click');
					this.removeClass('md-refresh')
				}
			}
		});
		$('.md-close').entwine({
			onclick: function() {
				this.parent().find('#MDEditorQuickPreview').close();
			}
		})

	});
})(jQuery)
(function($) {
	$.entwine('md', function($){
			$('textarea.markdown').entwine({
				PreviewPane: null,
				Parser: null,
				Interval: null,
				ModeLinkAutoComplete: 'test',
				AutoCompleteBuffer: null,
				ModeImageAutoComplete: false,
				AutoCompleteVisible: false,

				onmatch: function() {
					ModeLinkAutoComplete = false;
					AutoCompleteVisible = false;
					Parser = new Showdown.converter();
					PreviewPane = this.parent().find('.markdown_preview');
					PreviewPane.html(Parser.makeHtml(this.val()));
					this.trigger('redraw');
				},


				onfocusin: function() {
					self = this;
					Interval = setInterval(function() {
						PreviewPane.html(Parser.makeHtml(self.val()));
					}, 1000);
				},
			  onredraw: function() {
						console.log('button draw');
				},
				onunmatch: function() {
					if(typeof Interval != 'undefined')
						clearInterval(Interval);
				},
				onkeydown: function(e) {
					console.log(e.keyCode);
					var tab = 9;
					if(e.keyCode == tab) {
						e.preventDefault();
						var myValue = "    "
				    var startPos = e.target.selectionStart;
					  var endPos = e.target.selectionEnd;
					  var scrollTop = e.target.scrollTop;
					  e.target.value = e.target.value.substring(0, startPos) + myValue + e.target.value.substring(endPos,e.target.value.length);
			      e.target.selectionStart = startPos + myValue.length;
					  e.target.selectionEnd = startPos + myValue.length;
					  e.target.scrollTop = scrollTop;
						console.log('tab');
						return false;
					}
				},
				onkeyup: function(e) {
					if(e.keyCode == 186) {
				    var startPos = e.target.selectionStart;
				    if(e.target.value.substring(startPos-3, startPos) == "](:"){
							ModeLinkAutoComplete = startPos;
							AutoCompleteBuffer = "";
				    }
					}
					if(ModeLinkAutoComplete)
					{
						if(!AutoCompleteVisible) {
					    endPos = e.target.selectionEnd;

							var value = this.val()
							value = value.substring(0, startPos) + '<span id="markdown_CaretPosition">a</span>' + value.substring(endPos,value.length);
							value = value.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '<br />');

							$('.markdown_helper .markdown_CaretHelper').html(value);
							$('.markdown_helper .markdown_CaretHelper').scrollTop(this.scrollTop());

							var position = $('.markdown_helper .markdown_CaretHelper #markdown_CaretPosition').position();

							AutoCompleteVisible = true;

							self = this;

							$('#md_autosuggest')
								.css({
									'position' : 'absolute',
									'z-index' : 2000,
									'left' : position.left + 200,
									'top' : position.top - 5
								})
								.show()
								.focus()
								.keydown(
									function(e) {
										if(e.keyCode == 9) {
											e.preventDefault();
											console.log($(this));
											$.get(self.attr('findlink'), {ID: $(this).val()}, function() {
												var value = self.val();
												value = value.substring(0, startPos - 1) + $(this).val() + ')' + value.substring(endPos,value.length);
											});

											$(this).hide();
											self.val(value);
											self.insertTextToArea('asd');
											return false;
										}
								})
								.blur(
									function() {
										$(this).hide();
									}
								);
						}
						AutoCompleteBuffer = e.target.value.substring(ModeLinkAutoComplete,  e.target.selectionEnd);

						console.log(AutoCompleteBuffer);
					}
				}
			});
			$('#md_autosuggest').entwine({
				onmatch: function() {
						this.autocomplete({
							source: function( request, response ) {
								$.ajax({
									url: $('textarea.markdown').attr('linksuggest'),
									dataType: "json",
									data: {
										search: request.term
									},
									success: function( data ) {
										response( $.map( data, function( item ) {
											console.log(item.ID + " Label: " + item.Title);
											return {
												label: item.ID,
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
		});
})(jQuery);

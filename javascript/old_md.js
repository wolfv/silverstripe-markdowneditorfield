(function($) {

	$.entwine('md', function($){

		/**
		 * The "content" area contains all of the section specific UI (excluding the menu).
		 * This area can be a form itself, as well as contain one or more forms.
		 * For example, a page edit form might fill the whole area,
		 * while a ModelAdmin layout shows a search form on the left, and edit form on the right.
		 */
		$('textarea.markdown').entwine({
				onmatch: function() {

					/* Properties */

					Parser = null;
					Interval = null;

					ModeLinkAutoComplete = false;
					AutoCompleteVisible = false;

					Parser = new Showdown.converter();
					PreviewPane = this.parent().find('.markdown_preview');
					PreviewPane.html(Parser.makeHtml(this.val()));

					var self = this;

					this._super();
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
				onscroll: function() {

				},
				onkeydown: function(e) {
					var tab = 9;
					if(e.keyCode == tab) {
						e.preventDefault();
						this.insertText("    ", e.target.selectionStart, e.target.selectionEnd);
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

							$('#markdown_AutoSuggestLinks')
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
										if(e.keyCode == 9 || e.keyCode == 13) {
											e.preventDefault();
											$.get(self.attr('findlink'), {ID: $(this).val()}, function(data) {
												self.insertText(data + ')', startPos - 1, endPos)
											});
											$(this).hide();
											ModeLinkAutoComplete = false;
											AutoCompleteVisible = false;
											return false;
										}
								})
								.blur(
									function() {
										$(this).hide();
										ModeLinkAutoComplete = false;
										AutoCompleteVisible = false;
									}
								);
						}
					}
				},
				insertText: function(text, startPos, endPos) {
					obj = this[0];
					var scrollTop = obj.scrollTop;
					var value = obj.value;
					value = value.substring(0, startPos) + text + value.substring(endPos,value.length);
				  obj.value = value;
			   	obj.selectionStart = startPos + text.length;
					obj.selectionEnd = startPos + text.length;
					obj.scrollTop = scrollTop;
				}
			});
			$('#markdown_AutoSuggestLinks').entwine({
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

	});

})(jQuery);

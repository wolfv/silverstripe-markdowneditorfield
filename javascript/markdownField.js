(function($) {

	$.entwine('md', function($){
		$('.markdown_Iframe').entwine({
			Frame: null,
			onmatch: function() {
				self = this;
				Frame = self[0].contentWindow;
				this.closest('form').bind('beforesave', function() {
					var value = Frame.editor.getSession().getValue();
					self.parent().find('textarea.markdown').val(value);
				});
			}
		});
	});
})(jQuery)

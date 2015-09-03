CKEDITOR.plugins.add( 'defaultstyle', {
	init: function(editor) {
		if (!editor.config.defaultStyle) return;

		editor.on( 'change', function() {
			if ( editor.element.$.textContent ) return;

			var style = new CKEDITOR.style({
				element: editor.config.defaultStyle === 'bold' ? 'strong' : 'em'
			});
			editor.applyStyle( style );
		});
	}
});

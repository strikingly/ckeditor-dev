CKEDITOR.plugins.add( 'fontfamily', {
	init: function(editor) {
		var cmd = new CKEDITOR.command( editor, {
			exec: function(editor) {
				editor.config.fontfamilyCallback();
			}
		});
		editor.addCommand( 'fontfamily', cmd );
		editor.ui.addButton( 'FontFamily', {
			label: 'Font Family',
			command: 'fontfamily',
			toolbar: 'basicstyles'
		});
	}
});

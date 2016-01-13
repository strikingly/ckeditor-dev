CKEDITOR.plugins.add( 'defaultstyle', {
	init: function(editor) {
		if (!editor.config.defaultStyle) return;

		var name = editor.config.defaultStyle;
		var elem = name === 'bold' ? 'strong' : 'em';
		var style = new CKEDITOR.style({
			element: elem
		});

		var executingCmd = false;
		editor.on( 'beforeCommandExec', function(ev) {
			if (ev.data.name !== name) return;
			executingCmd = true;
		});

		editor.on( 'afterCommandExec', function(ev) {
			if (ev.data.name !== name) return;
			executingCmd = false;
		});

		editor.on( 'change', function() {
			// can't use editor.getData() because it changes content
			// which disrupts IMEs
			if ( executingCmd || editor.editable().getText().trim() ) return;
			editor.applyStyle( style );
		});

		editor.on( 'focus', function() {
			if ( editor.editable().getText().trim() ) return;

			// use setTimeout because directly calling doesn't apply style,
			// need investigation
			setTimeout(function() {
				editor.applyStyle( style );
			}, 0)
		});
	}
});

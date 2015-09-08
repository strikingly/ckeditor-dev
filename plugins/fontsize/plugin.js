CKEDITOR.plugins.add( 'fontsize', {
	requires: 'menubutton',
	init: function(editor) {
		function sizeCommand(editor, name, value) {
			this.editor = editor;
			this.name = name;
			this.value = value;
			this.context = 'p';
		}

		sizeCommand.prototype.exec = function(editor) {
			var selection = editor.getSelection();
			if (!selection) {
				return;
			}

			var bookmarks = selection.createBookmarks();
			var ranges = selection.getRanges();

			for (var i = ranges.length - 1; i >= 0; i--) {
				var iterator = ranges[ i ].createIterator();
				iterator.enlargeBr = true;

				while ( block = iterator.getNextParagraph( 'p' ) ) {
					if ( block.isReadOnly() ) continue;
					block.removeStyle( 'font-size' );
					if ( this.value !== 100 ) {
						block.setStyle( 'font-size', this.value + '%' );
					}
				}
			}

			editor.focus();
			editor.forceNextSelectionCheck();
			selection.selectBookmarks( bookmarks );
		}

		var smaller = new sizeCommand( editor, 'fontsizesmaller', 60 );
		var small = new sizeCommand( editor, 'fontsizesmall', 80 );
		var normal = new sizeCommand( editor, 'fontsizenormal', 100 );
		var large = new sizeCommand( editor, 'fontsizelarge', 130 );
		var larger = new sizeCommand( editor, 'fontsizelarger', 160 );

		editor.addCommand( 'fontsizesmaller', smaller );
		editor.addCommand( 'fontsizesmall', small );
		editor.addCommand( 'fontsizenormal', normal );
		editor.addCommand( 'fontsizelarge', large );
		editor.addCommand( 'fontsizelarger', larger );

		editor.ui.add( 'FontSize', CKEDITOR.UI_MENUBUTTON, {
			label: 'Change Font Size',
			onMenu: function () {
				return {
					fontsizeSmaller: CKEDITOR.TRISTATE_OFF,
					fontsizeSmall: CKEDITOR.TRISTATE_OFF,
					fontsizeNormal: CKEDITOR.TRISTATE_OFF,
					fontsizeLarge: CKEDITOR.TRISTATE_OFF,
					fontsizeLarger: CKEDITOR.TRISTATE_OFF
				};
			}
		});

		var menuGroup = 'fontsizeButton';
		editor.addMenuGroup( menuGroup );
		editor.addMenuItems({
			fontsizeSmaller: {
				label: 'Smaller',
				group: menuGroup,
				command: 'fontsizesmaller'
			},
			fontsizeSmall: {
				label: 'Small',
				group: menuGroup,
				command: 'fontsizesmall'
			},
			fontsizeNormal: {
				label: 'Normal',
				group: menuGroup,
				command: 'fontsizenormal'
			},
			fontsizeLarge: {
				label: 'Large',
				group: menuGroup,
				command: 'fontsizelarge'
			},
			fontsizeLarger: {
				label: 'Larger',
				group: menuGroup,
				command: 'fontsizelarger'
			}
		});
	}
});

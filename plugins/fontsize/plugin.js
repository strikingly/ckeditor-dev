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

		var xsmall = new sizeCommand( editor, 'fontsizexsmaller', 60 );
		var small = new sizeCommand( editor, 'fontsizesmaller', 80 );
		var medium = new sizeCommand( editor, 'fontsizenormal', 100 );
		var large = new sizeCommand( editor, 'fontsizelarger', 130 );
		var xlarge = new sizeCommand( editor, 'fontsizexlarger', 160 );

		editor.addCommand( 'fontsizexsmaller', xsmall );
		editor.addCommand( 'fontsizesmaller', small );
		editor.addCommand( 'fontsizenormal', medium );
		editor.addCommand( 'fontsizelarger', large );
		editor.addCommand( 'fontsizexlarger', xlarge );

		editor.ui.add( 'FontSize', CKEDITOR.UI_MENUBUTTON, {
			label: 'Change Font Size',
			onMenu: function () {
				return {
					fontsizeXSmaller: CKEDITOR.TRISTATE_OFF,
					fontsizeSmaller: CKEDITOR.TRISTATE_OFF,
					fontsizeNormal: CKEDITOR.TRISTATE_OFF,
					fontsizeLarger: CKEDITOR.TRISTATE_OFF,
					fontsizeXLarger: CKEDITOR.TRISTATE_OFF
				};
			}
		});

		var menuGroup = 'fontsizeButton';
		editor.addMenuGroup( menuGroup );
		editor.addMenuItems({
			fontsizeXSmaller: {
				label: 'Extra Smaller',
				group: menuGroup,
				command: 'fontsizexsmaller'
			},
			fontsizeSmaller: {
				label: 'Smaller',
				group: menuGroup,
				command: 'fontsizesmaller'
			},
			fontsizeNormal: {
				label: 'Normal',
				group: menuGroup,
				command: 'fontsizenormal'
			},
			fontsizeLarger: {
				label: 'Larger',
				group: menuGroup,
				command: 'fontsizelarger'
			},
			fontsizeXLarger: {
				label: 'Extra Larger',
				group: menuGroup,
				command: 'fontsizexlarger'
			}
		});
	}
});

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

		var xsmall = new sizeCommand( editor, 'fontsizexsmall', 60 );
		var small = new sizeCommand( editor, 'fontsizesmall', 80 );
		var medium = new sizeCommand( editor, 'fontsizemedium', 100 );
		var large = new sizeCommand( editor, 'fontsizelarge', 130 );
		var xlarge = new sizeCommand( editor, 'fontsizexlarge', 160 );

		editor.addCommand( 'fontsizexsmall', xsmall );
		editor.addCommand( 'fontsizesmall', small );
		editor.addCommand( 'fontsizemedium', medium );
		editor.addCommand( 'fontsizelarge', large );
		editor.addCommand( 'fontsizexlarge', xlarge );

		editor.ui.add( 'FontSize', CKEDITOR.UI_MENUBUTTON, {
			label: 'Font Size',
			onMenu: function () {
				return {
					fontsizeXSmall: CKEDITOR.TRISTATE_OFF,
					fontsizeSmall: CKEDITOR.TRISTATE_OFF,
					fontsizeMedium: CKEDITOR.TRISTATE_OFF,
					fontsizeLarge: CKEDITOR.TRISTATE_OFF,
					fontsizeXLarge: CKEDITOR.TRISTATE_OFF
				};
			}
		});

		var menuGroup = 'fontsizeButton';
		editor.addMenuGroup( menuGroup );
		editor.addMenuItems({
			fontsizeXSmall: {
				label: 'Extra Small',
				group: menuGroup,
				command: 'fontsizexsmall'
			},
			fontsizeSmall: {
				label: 'Small',
				group: menuGroup,
				command: 'fontsizesmall'
			},
			fontsizeMedium: {
				label: 'Medium',
				group: menuGroup,
				command: 'fontsizemedium'
			},
			fontsizeLarge: {
				label: 'Large',
				group: menuGroup,
				command: 'fontsizelarge'
			},
			fontsizeXLarge: {
				label: 'Extra Large',
				group: menuGroup,
				command: 'fontsizexlarge'
			}
		});
	}
});

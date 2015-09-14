CKEDITOR.plugins.add( 'fontsize', {
	requires: 'menubutton',
	init: function(editor) {
		function getSize(element) {
			var size = element.getStyle( 'font-size' );
			if (size.slice(-1) === '%') {
				return parseInt(size, 10);
			}
			return 100;
		}

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

			var range = editor.createRange();
			range.selectNodeContents( editor.editable() );
			var iterator = range.createIterator();
			iterator.enlargeBr = true;

			while ( block = iterator.getNextParagraph( 'p' ) ) {
				if ( block.isReadOnly() ) continue;
				block.removeStyle( 'font-size' );
				if ( this.value !== 100 ) {
					block.setStyle( 'font-size', this.value + '%' );
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
				var size;
				var selection = editor.getSelection();
				if (!selection) {
					size = 100;
				} else {
					var range = selection.getRanges()[0];
					var iterator = range.createIterator();
					iterator.enlargeBr = true;
					block = iterator.getNextParagraph( 'p' );
					size = getSize(block);
				}

				return {
					fontsizeSmaller: size === 60 ? CKEDITOR.TRISTATE_ON : CKEDITOR.TRISTATE_OFF,
					fontsizeSmall: size === 80 ? CKEDITOR.TRISTATE_ON : CKEDITOR.TRISTATE_OFF,
					fontsizeNormal: size === 100 ? CKEDITOR.TRISTATE_ON : CKEDITOR.TRISTATE_OFF,
					fontsizeLarge: size === 130 ? CKEDITOR.TRISTATE_ON : CKEDITOR.TRISTATE_OFF,
					fontsizeLarger: size === 160 ? CKEDITOR.TRISTATE_ON : CKEDITOR.TRISTATE_OFF
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

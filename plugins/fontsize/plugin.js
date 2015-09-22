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

		var cmdDefs = [{
			label: 'Smaller',
			name: 'fontsizeSmaller',
			size: 60
		}, {
			label: 'Small',
			name: 'fontsizeSmall',
			size: 80
		}, {
			label: 'Normal',
			name: 'fontsizeNormal',
			size: 100
		}, {
			label: 'Large',
			name: 'fontsizeLarge',
			size: 130
		}, {
			label: 'Larger',
			name: 'fontsizeLarger',
			size: 160
		}];

		for ( var i = 0; i < cmdDefs.length; i++ ) {
			var cmdDef = cmdDefs[ i ];
			var cmd = new sizeCommand( editor, cmdDef.name.toLowerCase(), cmdDef.size );
			editor.addCommand( cmdDef.name.toLowerCase(), cmd );
		}

		var minFontSize = editor.config.minFontSize;
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

				var bodySize = parseInt( editor.element.getComputedStyle( 'font-size' ), 10 );
				var minPerc = minFontSize / bodySize * 100;

				var items = {};
				for ( var i = 0; i < cmdDefs.length; i++ ) {
					var cmdDef = cmdDefs[ i ];
					if ( !minFontSize || cmdDef.size >= minPerc ) {
						items[ cmdDef.name ] = size === cmdDef.size ? CKEDITOR.TRISTATE_ON : CKEDITOR.TRISTATE_OFF;
					}
				}

				return items;
			}
		});

		var menuGroup = 'fontsizeButton';
		editor.addMenuGroup( menuGroup );
		var items = {};
		for ( var i = 0; i < cmdDefs.length; i++ ) {
			var cmdDef = cmdDefs[ i ];
			items[ cmdDef.name ] = {
				label: cmdDef.label,
				group: menuGroup,
				command: cmdDef.name.toLowerCase()
			};
		}
		editor.addMenuItems(items);
	}
});

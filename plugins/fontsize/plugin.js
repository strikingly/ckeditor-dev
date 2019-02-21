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

			if (this.editor.config.advancedEditor) {
				var ranges = selection.getRanges() || [];
				var _this = this;
				function getBlockContainer(element) {
					var elName = element.getName();				
					var parent = element.getParent(),
						pName = parent.getName(),
						// More reliable way on checking whether the div is container or not
						isContainer = parent.getAttribute('contenteditable') && pName === 'div' && elName !== 'ul' && elName !== 'ol'

					if(elName === 'p' || elName === 'li' || isContainer) {
						return element;
					} else {
						return getBlockContainer(parent);
					}
				}
				ranges.map(function(range) {
					var walker = new CKEDITOR.dom.walker(range);
					var element = walker.next() || range.endPath().elements[0];
					while(element) {
						if (element.type === CKEDITOR.NODE_TEXT) {
							element = element.getParent();
						}
						element = getBlockContainer(element);
						if (_this.value)  {
							element.setStyle('font-size', _this.value + '%')
						}

						element = walker.next()
					}
				})
			} else {
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
			}

			editor.focus();
			editor.forceNextSelectionCheck();
			selection.selectBookmarks( bookmarks );
		}

		var cmdDefs = [{
			label: editor.lang.fontsize.smaller,
			name: 'fontsizeSmaller',
			size: 60
		}, {
			label: editor.lang.fontsize.small,
			name: 'fontsizeSmall',
			size: 80
		}, {
			label: editor.lang.fontsize.normal,
			name: 'fontsizeNormal',
			size: 100
		}, {
			label: editor.lang.fontsize.large,
			name: 'fontsizeLarge',
			size: 130
		}, {
			label: editor.lang.fontsize.larger,
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
			label: editor.lang.fontsize.label,
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

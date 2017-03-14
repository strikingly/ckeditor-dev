/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview Justify commands.
 */

( function() {
	function getAlignment( element, useComputedState ) {
		useComputedState = useComputedState === undefined || useComputedState;

		var align;
		if ( useComputedState )
			align = element.getComputedStyle( 'text-align' );
		else {
			while ( !element.hasAttribute || !( element.hasAttribute( 'align' ) || element.getStyle( 'text-align' ) ) ) {
				var parent = element.getParent();
				if ( !parent )
					break;
				element = parent;
			}
			align = element.getStyle( 'text-align' ) || element.getAttribute( 'align' ) || '';
		}

		// Sometimes computed values doesn't tell.
		align && ( align = align.replace( /(?:-(?:moz|webkit)-)?(?:start|auto)/i, '' ) );

		!align && useComputedState && ( align = element.getComputedStyle( 'direction' ) == 'rtl' ? 'right' : 'left' );

		return align;
	}

	function justifyCommand( editor, name, value ) {
		this.editor = editor;
		this.name = name;
		this.value = value;
		this.context = 'p';

		var classes = editor.config.justifyClasses,
			blockTag = editor.config.enterMode == CKEDITOR.ENTER_P ? 'p' : 'div';

		if ( classes ) {
			switch ( value ) {
				case 'left':
					this.cssClassName = classes[ 0 ];
					break;
				case 'center':
					this.cssClassName = classes[ 1 ];
					break;
				case 'right':
					this.cssClassName = classes[ 2 ];
					break;
				case 'justify':
					this.cssClassName = classes[ 3 ];
					break;
			}

			this.cssClassRegex = new RegExp( '(?:^|\\s+)(?:' + classes.join( '|' ) + ')(?=$|\\s)' );
			this.requiredContent = blockTag + '(' + this.cssClassName + ')';
		}
		else {
			this.requiredContent = blockTag + '{text-align}';
		}

		this.allowedContent = {
			'caption div h1 h2 h3 h4 h5 h6 p pre td th li': {
				// Do not add elements, but only text-align style if element is validated by other rule.
				propertiesOnly: true,
				styles: this.cssClassName ? null : 'text-align',
				classes: this.cssClassName || null
			}
		};

		// In enter mode BR we need to allow here for div, because when non other
		// feature allows div justify is the only plugin that uses it.
		if ( editor.config.enterMode == CKEDITOR.ENTER_BR )
			this.allowedContent.div = true;
	}

	function onDirChanged( e ) {
		var editor = e.editor;

		var range = editor.createRange();
		range.setStartBefore( e.data.node );
		range.setEndAfter( e.data.node );

		var walker = new CKEDITOR.dom.walker( range ),
			node;

		while ( ( node = walker.next() ) ) {
			if ( node.type == CKEDITOR.NODE_ELEMENT ) {
				// A child with the defined dir is to be ignored.
				if ( !node.equals( e.data.node ) && node.getDirection() ) {
					range.setStartAfter( node );
					walker = new CKEDITOR.dom.walker( range );
					continue;
				}

				// Switch the alignment.
				var classes = editor.config.justifyClasses;
				if ( classes ) {
					// The left align class.
					if ( node.hasClass( classes[ 0 ] ) ) {
						node.removeClass( classes[ 0 ] );
						node.addClass( classes[ 2 ] );
					}
					// The right align class.
					else if ( node.hasClass( classes[ 2 ] ) ) {
						node.removeClass( classes[ 2 ] );
						node.addClass( classes[ 0 ] );
					}
				}

				// Always switch CSS margins.
				var style = 'text-align';
				var align = node.getStyle( style );

				if ( align == 'left' )
					node.setStyle( style, 'right' );
				else if ( align == 'right' )
					node.setStyle( style, 'left' );
			}
		}
	}

	justifyCommand.prototype = {
		exec: function( editor ) {
			var selection = editor.getSelection(),
				enterMode = editor.config.enterMode;

			if ( !selection )
				return;

			var bookmarks = selection.createBookmarks(),
				ranges = selection.getRanges();

			var cssClassName = this.cssClassName,
				iterator, block;

			var useComputedState = editor.config.useComputedState;
			useComputedState = useComputedState === undefined || useComputedState;

			for ( var i = ranges.length - 1; i >= 0; i-- ) {
				iterator = ranges[ i ].createIterator();
				iterator.enlargeBr = enterMode != CKEDITOR.ENTER_BR;

				while ( ( block = iterator.getNextParagraph( enterMode == CKEDITOR.ENTER_P ? 'p' : 'div' ) ) ) {
					if ( block.isReadOnly() )
						continue;

					block.removeAttribute( 'align' );
					block.removeStyle( 'text-align' );

					// Remove any of the alignment classes from the className.
					var className = cssClassName && ( block.$.className = CKEDITOR.tools.ltrim( block.$.className.replace( this.cssClassRegex, '' ) ) );

					var apply = ( this.state == CKEDITOR.TRISTATE_OFF ) && ( !useComputedState || ( getAlignment( block, true ) != this.value ) );

					if ( cssClassName ) {
						// Append the desired class name.
						if ( apply )
							block.addClass( cssClassName );
						else if ( !className )
							block.removeAttribute( 'class' );
					} else if ( apply ) {
						block.setStyle( 'text-align', this.value );
					}
				}

			}

			editor.focus();
			editor.forceNextSelectionCheck();
			selection.selectBookmarks( bookmarks );
		},

		refresh: function( editor, path ) {
			var firstBlock = path.block || path.blockLimit;

			this.setState( firstBlock.getName() != 'body' && getAlignment( firstBlock, this.editor.config.useComputedState ) == this.value ? CKEDITOR.TRISTATE_ON : CKEDITOR.TRISTATE_OFF );
		}
	};

// The html
	function renderJustifyGroupBlock() {
    var editor= this;

    var reHtml = '<table style="table-layout: fixed;overflow: hidden;">';

    var clickFn = CKEDITOR.tools.addFunction(function(type){
      switch(type) {
        case 'left':
          editor.execCommand('justifyleft');
          break;
        case 'center':
          editor.execCommand('justifycenter');
          break;
				case 'right':
          editor.execCommand('justifyright');
          break;
				case 'justify':
          editor.execCommand('justifyblock');
          break;
      }

    })

		var leftStyle = CKEDITOR.skin.getIconStyle('justifyleft', false),
			rightStyle = CKEDITOR.skin.getIconStyle('justifyright', false),
			centerStyle = CKEDITOR.skin.getIconStyle('justifycenter', false),
			justifyStyle = CKEDITOR.skin.getIconStyle('justifyblock', false);

    reHtml += '<tr><td><a class="cke_button" onclick="CKEDITOR.tools.callFunction(' + clickFn + ', \'left\')" data-align="left"><span class="cke_button_icon cke_button__justifyleft_icon" style="' + leftStyle + '"></span></a>'
    reHtml += '<a class="cke_button" onclick="CKEDITOR.tools.callFunction(' + clickFn + ', \'center\')" data-align="center"><span class="cke_button_icon cke_button__justifycenter_icon" style="' + centerStyle + '"></span></a>'
		reHtml += '<a class="cke_button" onclick="CKEDITOR.tools.callFunction(' + clickFn + ', \'right\')" data-align="right"><span class="cke_button_icon cke_button__justifyright_icon" style="' + rightStyle + '"></span></a>'
		reHtml += '<a class="cke_button" onclick="CKEDITOR.tools.callFunction(' + clickFn + ', \'justify\')" data-align="justify"><span class="cke_button_icon cke_button__justifyblock_icon" style="' + justifyStyle + '"></span></a><td><tr></table>'

    return reHtml
  }

	function getElementAlignment(el) {
		var alignment = el.getComputedStyle('text-align')
		return alignment === 'justify' ? 'block' : alignment
	}

	function onSelectionChange(toolbarName, blockEl) {
		var editor = this;
		var el = editor.getSelection().getStartElement();

		var elAlignment = getElementAlignment(el);

		var btn = editor.ui.get(toolbarName);
		var element = CKEDITOR.document.getById(btn._.id);
		var span = element.find('.cke_button_icon').getItem(0);
		var cla = 'justify' + elAlignment,
				style = CKEDITOR.skin.getIconStyle('justify' + elAlignment, false);

		span.setAttributes({
			'style': style,
			'class': 'cke_button_icon cke_button__' + cla + '_icon',
		})

		if (blockEl.el) {
			var btns = blockEl.el.find('a.cke_button')
			
			for (var i=0, len=btns.count(); i<len; i++ ){
				btns.getItem(i).removeClass('cke_button_on').addClass('cke_button_off')
			}
			blockEl.el.findOne('a[data-align=' + (elAlignment === 'block' ? 'justify' : elAlignment) + ']').addClass('cke_button_on')
		}
	}

	CKEDITOR.plugins.add( 'justify', {
		// jscs:disable maximumLineLength
		lang: 'af,ar,bg,bn,bs,ca,cs,cy,da,de,el,en,en-au,en-ca,en-gb,eo,es,et,eu,fa,fi,fo,fr,fr-ca,gl,gu,he,hi,hr,hu,id,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,tt,ug,uk,vi,zh,zh-cn', // %REMOVE_LINE_CORE%
		// jscs:enable maximumLineLength
		icons: 'justifyblock,justifycenter,justifyleft,justifyright', // %REMOVE_LINE_CORE%
		hidpi: true, // %REMOVE_LINE_CORE%
		init: function( editor ) {
			if ( editor.blockless )
				return;

			var blockEl = {};
			var toolbarName = 'JustifyGroup';

			var left = new justifyCommand( editor, 'justifyleft', 'left' ),
				center = new justifyCommand( editor, 'justifycenter', 'center' ),
				right = new justifyCommand( editor, 'justifyright', 'right' ),
				justify = new justifyCommand( editor, 'justifyblock', 'justify' );

			editor.addCommand( 'justifyleft', left );
			editor.addCommand( 'justifycenter', center );
			editor.addCommand( 'justifyright', right );
			editor.addCommand( 'justifyblock', justify );

			if (editor.config.redesignedTextEditor) {
				// Change icon status
				editor.on('selectionChange', onSelectionChange.bind(editor, toolbarName, blockEl));
			}

			if ( editor.ui.addButton ) {
				if (editor.config.redesignedTextEditor) {
					editor.ui.add( toolbarName, CKEDITOR.UI_PANELBUTTON, {
						modes: { wysiwyg: 1 },
						toolbar: 'justify,50',
						editorFocus: 0,
						panel: {
							css: CKEDITOR.skin.getPath( 'editor' ),
							attributes: { role: 'justifybox', 'aria-label': '' }
						},

						onBlock: function( panel, block ) {
							blockEl.el = block.element;
							block.autoSize = true;
							block.element.addClass( 'cke_justifygroupblock' );
							block.element.setStyle( 'width', '122px' ); // span(28px) * 4 + padding
							block.element.setHtml( renderJustifyGroupBlock.call(editor) );
							block.element.getDocument().getBody().setStyle('overflow', 'hidden');

							CKEDITOR.ui.fire('ready', this);

							onSelectionChange.call(editor, toolbarName, blockEl);
						}
					})
				}
				editor.ui.addButton( 'JustifyLeft', {
					label: editor.lang.justify.left,
					command: 'justifyleft',
					toolbar: 'align,10'
				} );
				editor.ui.addButton( 'JustifyCenter', {
					label: editor.lang.justify.center,
					command: 'justifycenter',
					toolbar: 'align,20'
				} );
				editor.ui.addButton( 'JustifyRight', {
					label: editor.lang.justify.right,
					command: 'justifyright',
					toolbar: 'align,30'
				} );
				editor.ui.addButton( 'JustifyBlock', {
					label: editor.lang.justify.block,
					command: 'justifyblock',
					toolbar: 'align,40'
				} );
			}

			editor.on( 'dirChanged', onDirChanged );
		}
	} );
} )();

/**
 * List of classes to use for aligning the contents. If it's `null`, no classes will be used
 * and instead the corresponding CSS values will be used.
 *
 * The array should contain 4 members, in the following order: left, center, right, justify.
 *
 *		// Use the classes 'AlignLeft', 'AlignCenter', 'AlignRight', 'AlignJustify'
 *		config.justifyClasses = [ 'AlignLeft', 'AlignCenter', 'AlignRight', 'AlignJustify' ];
 *
 * @cfg {Array} [justifyClasses=null]
 * @member CKEDITOR.config
 */

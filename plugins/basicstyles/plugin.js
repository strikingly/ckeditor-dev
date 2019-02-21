/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.plugins.add( 'basicstyles', {
	// jscs:disable maximumLineLength
	lang: 'af,ar,bg,bn,bs,ca,cs,cy,da,de,el,en,en-au,en-ca,en-gb,eo,es,et,eu,fa,fi,fo,fr,fr-ca,gl,gu,he,hi,hr,hu,id,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,tt,ug,uk,vi,zh,zh-cn', // %REMOVE_LINE_CORE%
	// jscs:enable maximumLineLength
	icons: 'bold,italic,underline,strike,subscript,superscript', // %REMOVE_LINE_CORE%
	hidpi: true, // %REMOVE_LINE_CORE%
	init: function( editor ) {
		var order = 0;
		// All buttons use the same code to register. So, to avoid
		// duplications, let's use this tool function.
		var addButtonCommand = function( buttonName, buttonLabel, commandName, styleDefiniton ) {
				// Disable the command if no definition is configured.
				if ( !styleDefiniton )
					return;

				var style = new CKEDITOR.style( styleDefiniton ),
					forms = contentForms[ commandName ];

				// Put the style as the most important form.
				forms.unshift( style );

				// Listen to contextual style activation.
				editor.attachStyleStateChange( style, function( state ) {
					!editor.readOnly && editor.getCommand( commandName ).setState( state );
				} );

				// Create the command that can be used to apply the style.
				editor.addCommand( commandName, new CKEDITOR.styleCommand( style, {
					contentForms: forms
				} ) );

				// Register the button, if the button plugin is loaded.
				if ( editor.ui.addButton ) {
					editor.ui.addButton( buttonName, {
						label: buttonLabel,
						command: commandName,
						toolbar: 'basicstyles,' + ( order += 10 )
					} );
				}
			};

		var contentForms = {
				bold: [
					'strong',
					'b',
					[ 'span', function( el ) {
						var fw = el.styles[ 'font-weight' ];
						return fw == 'bold' || +fw >= 700;
					} ]
				],

				italic: [
					'em',
					'i',
					[ 'span', function( el ) {
						return el.styles[ 'font-style' ] == 'italic';
					} ]
				],

				underline: [
					'u',
					[ 'span', function( el ) {
						return el.styles[ 'text-decoration' ] == 'underline';
					} ]
				],

				strike: [
					's',
					'strike',
					[ 'span', function( el ) {
						return el.styles[ 'text-decoration' ] == 'line-through';
					} ]
				],

				subscript: [
					'sub'
				],

				superscript: [
					'sup'
				]
			},
			config = editor.config,
			lang = editor.lang.basicstyles;

		addButtonCommand( 'Bold', lang.bold, 'bold', config.coreStyles_bold );
		addButtonCommand( 'Italic', lang.italic, 'italic', config.coreStyles_italic );
		addButtonCommand( 'Underline', lang.underline, 'underline', config.coreStyles_underline );
		addButtonCommand( 'Strike', lang.strike, 'strike', config.coreStyles_strike );
		addButtonCommand( 'Subscript', lang.subscript, 'subscript', config.coreStyles_subscript );
		addButtonCommand( 'Superscript', lang.superscript, 'superscript', config.coreStyles_superscript );

		editor.setKeystroke( [
			[ CKEDITOR.CTRL + 66 /*B*/, 'bold' ],
			[ CKEDITOR.CTRL + 73 /*I*/, 'italic' ],
			[ CKEDITOR.CTRL + 85 /*U*/, 'underline' ]
		] );

		function renderScriptGroupBlock() {
			var editor= this;

			var reHtml = '';

			var clickFn = CKEDITOR.tools.addFunction(function(type){
				switch(type) {
					case 'sub':
						editor.execCommand('subscript');
						break;
					case 'sup':
						editor.execCommand('superscript');
						break;
				}
			})

			var subStyle = CKEDITOR.skin.getIconStyle('subscript', false),
				supStyle = CKEDITOR.skin.getIconStyle('superscript', false);

			reHtml += '<a class="cke_button ck_btn_with_gray_border_top" onclick="CKEDITOR.tools.callFunction(' + clickFn + ', \'sub\')" data-type="sub" style="float: left;outline: none;"><span class="cke_button_icon cke_button__subscript_icon" style="' + subStyle + '"></span></a>'
			reHtml += '<a class="cke_button ck_btn_with_gray_border_top" onclick="CKEDITOR.tools.callFunction(' + clickFn + ', \'sup\')" data-type="sup" style="float: left;outline: none;"><span class="cke_button_icon cke_button__superscript_icon" style="' + supStyle + '"></span></a>'

			return reHtml
		}

		function onSelectionChange(toobarName, blockEl) {
			var editor = this;
			var el = editor.getSelection().getStartElement();

			var btn = editor.ui.get(toolbarName);
			if (!btn) {
				return
			}
			var element = CKEDITOR.document.getById(btn._.id);
			var span = element.find('.cke_button_icon').getItem(0);
			var arrow = element.find('.cke_button_arrow').getItem(0);

			span.setText('...')
			span.setStyles({
				'color': 'white',
				'text-align': 'center',
				'font-size': '18px',
				'position': 'relative',
				'top': '-6px'
			})
			if (arrow) {
				arrow.remove()
			}

			var elType = el.getName()

			if (blockEl.el) {
				var btns = blockEl.el.find('a.cke_button')
				
				for (var i=0, len=btns.count(); i<len; i++ ){
					btns.getItem(i).removeClass('cke_button_on').addClass('cke_button_off')
				}
				if (elType === 'sub' || elType === 'sup') {
					blockEl.el.findOne('a[data-type=' + elType + ']').addClass('cke_button_on')
				}
			}
		}

		var toolbarName = 'ScriptGroup';
		var blockEl = {};
		editor.on('selectionChange', onSelectionChange.bind(editor, toolbarName, blockEl));
		editor.ui.add(toolbarName, CKEDITOR.UI_PANELBUTTON, {
			label: '', // remove tooltip
			modes: { wysiwyg: 1 },
			toolbar: 'script,60',
			editorFocus: 0,
			panel: {
				css: CKEDITOR.skin.getPath( 'editor' ),
				attributes: { role: 'scriptbox', 'aria-label': '' }
			},

			onBlock: function( panel, block ) {
				blockEl.el = block.element;
				block.autoSize = true;
				block.element.addClass( 'cke_scriptgroupblock' );
				block.element.setStyles({
					'width': '56px',
					'overflow': 'hidden',
					'white-space': 'nowrap',
					'outline': 'none'
				}); // span(28px) * 2 + paddin
				block.element.setHtml( renderScriptGroupBlock.call(editor) );
				block.element.getDocument().getBody().setStyle('overflow', 'hidden');

				CKEDITOR.ui.fire('ready', this);

				onSelectionChange.call(editor, toolbarName, blockEl);
			}
		})
	}
} );

// Basic Inline Styles.

/**
 * The style definition that applies the **bold** style to the text.
 *
 *		config.coreStyles_bold = { element: 'b', overrides: 'strong' };
 *
 *		config.coreStyles_bold = {
 *			element: 'span',
 *			attributes: { 'class': 'Bold' }
 *		};
 *
 * @cfg
 * @member CKEDITOR.config
 */
CKEDITOR.config.coreStyles_bold = { element: 'strong', overrides: 'b' };

/**
 * The style definition that applies the *italics* style to the text.
 *
 *		config.coreStyles_italic = { element: 'i', overrides: 'em' };
 *
 *		CKEDITOR.config.coreStyles_italic = {
 *			element: 'span',
 *			attributes: { 'class': 'Italic' }
 *		};
 *
 * @cfg
 * @member CKEDITOR.config
 */
CKEDITOR.config.coreStyles_italic = { element: 'em', overrides: 'i' };

/**
 * The style definition that applies the <u>underline</u> style to the text.
 *
 *		CKEDITOR.config.coreStyles_underline = {
 *			element: 'span',
 *			attributes: { 'class': 'Underline' }
 *		};
 *
 * @cfg
 * @member CKEDITOR.config
 */
CKEDITOR.config.coreStyles_underline = { element: 'u' };

/**
 * The style definition that applies the <strike>strikethrough</strike> style to the text.
 *
 *		CKEDITOR.config.coreStyles_strike = {
 *			element: 'span',
 *			attributes: { 'class': 'Strikethrough' },
 *			overrides: 'strike'
 *		};
 *
 * @cfg
 * @member CKEDITOR.config
 */
CKEDITOR.config.coreStyles_strike = { element: 's', overrides: 'strike' };

/**
 * The style definition that applies the subscript style to the text.
 *
 *		CKEDITOR.config.coreStyles_subscript = {
 *			element: 'span',
 *			attributes: { 'class': 'Subscript' },
 *			overrides: 'sub'
 *		};
 *
 * @cfg
 * @member CKEDITOR.config
 */
CKEDITOR.config.coreStyles_subscript = { element: 'sub' };

/**
 * The style definition that applies the superscript style to the text.
 *
 *		CKEDITOR.config.coreStyles_superscript = {
 *			element: 'span',
 *			attributes: { 'class': 'Superscript' },
 *			overrides: 'sup'
 *		};
 *
 * @cfg
 * @member CKEDITOR.config
 */
CKEDITOR.config.coreStyles_superscript = { element: 'sup' };

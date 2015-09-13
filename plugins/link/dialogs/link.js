/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

'use strict';

( function() {
	CKEDITOR.dialog.add( 'link', function( editor ) {
		var plugin = CKEDITOR.plugins.link;

		// Handles the event when the "Target" selection box is changed.
		var targetChanged = function() {
				var dialog = this.getDialog(),
					popupFeatures = dialog.getContentElement( 'target', 'popupFeatures' ),
					targetName = dialog.getContentElement( 'target', 'linkTargetName' ),
					value = this.getValue();

				if ( !popupFeatures || !targetName )
					return;

				popupFeatures = popupFeatures.getElement();
				popupFeatures.hide();
				targetName.setValue( '' );

				switch ( value ) {
					case 'frame':
						targetName.setLabel( editor.lang.link.targetFrameName );
						targetName.getElement().show();
						break;
					case 'popup':
						popupFeatures.show();
						targetName.setLabel( editor.lang.link.targetPopupName );
						targetName.getElement().show();
						break;
					default:
						targetName.setValue( value );
						targetName.getElement().hide();
						break;
				}

			};

		// Handles the event when the "Type" selection box is changed.
		var linkTypeChanged = function() {
				var dialog = this.getDialog(),
					partIds = [ 'urlOptions', 'anchorOptions', 'emailOptions' ],
					typeValue = this.getValue(),
					uploadTab = dialog.definition.getContents( 'upload' ),
					uploadInitiallyHidden = uploadTab && uploadTab.hidden;

				if ( typeValue == 'url' ) {
					if ( editor.config.linkShowTargetTab )
						dialog.showPage( 'target' );
					if ( !uploadInitiallyHidden )
						dialog.showPage( 'upload' );
				} else {
					dialog.hidePage( 'target' );
					if ( !uploadInitiallyHidden )
						dialog.hidePage( 'upload' );
				}

				for ( var i = 0; i < partIds.length; i++ ) {
					var element = dialog.getContentElement( 'info', partIds[ i ] );
					if ( !element )
						continue;

					element = element.getElement().getParent().getParent();
					if ( partIds[ i ] == typeValue + 'Options' )
						element.show();
					else
						element.hide();
				}

				dialog.layout();
			};

		var setupParams = function( page, data ) {
				if ( data[ page ] )
					this.setValue( data[ page ][ this.id ] || '' );
			};

		var setupPopupParams = function( data ) {
				return setupParams.call( this, 'target', data );
			};

		var setupAdvParams = function( data ) {
				return setupParams.call( this, 'advanced', data );
			};

		var commitParams = function( page, data ) {
				if ( !data[ page ] )
					data[ page ] = {};

				data[ page ][ this.id ] = this.getValue() || '';
			};

		var commitPopupParams = function( data ) {
				return commitParams.call( this, 'target', data );
			};

		var commitAdvParams = function( data ) {
				return commitParams.call( this, 'advanced', data );
			};

		var commonLang = editor.lang.common,
			linkLang = editor.lang.link,
			anchors;

		return {
			title: linkLang.title,
			minWidth: 350,
			minHeight: 230,
			resizable: CKEDITOR.DIALOG_RESIZE_NONE,
			buttons: [ CKEDITOR.dialog.okButton ],
			contents: [ {
				id: 'info',
				label: linkLang.info,
				title: linkLang.info,
				elements: [ {
					id: 'linkType',
					type: 'select',
					label: linkLang.type,
					'default': 'url',
					items: [
						[ linkLang.toUrl, 'url' ],
						[ linkLang.toEmail, 'email' ]
					],
					onChange: linkTypeChanged,
					setup: function( data ) {
						this.setValue( data.type || 'url' );
					},
					commit: function( data ) {
						data.type = this.getValue();
					}
				},
				{
					type: 'vbox',
					id: 'urlOptions',
					children: [ {
						type: 'hbox',
						widths: [ '25%', '75%' ],
						children: [ {
							id: 'protocol',
							type: 'select',
							label: commonLang.protocol,
							'default': 'http://',
							items: [
								// Force 'ltr' for protocol names in BIDI. (#5433)
								[ 'http://\u200E', 'http://' ],
								[ 'https://\u200E', 'https://' ],
								[ 'ftp://\u200E', 'ftp://' ],
								[ linkLang.other, '' ]
							],
							setup: function( data ) {
								if ( data.url )
									this.setValue( data.url.protocol || '' );
							},
							commit: function( data ) {
								if ( !data.url )
									data.url = {};

								data.url.protocol = this.getValue();
							}
						},
						{
							type: 'text',
							id: 'url',
							label: commonLang.url,
							onLoad: function() {
								this.allowOnChange = true;
							},
							onKeyUp: function() {
								this.allowOnChange = false;
								var protocolCmb = this.getDialog().getContentElement( 'info', 'protocol' ),
									url = this.getValue(),
									urlOnChangeProtocol = /^(http|https|ftp):\/\/(?=.)/i,
									urlOnChangeTestOther = /^((javascript:)|[#\/\.\?])/i;

								var protocol = urlOnChangeProtocol.exec( url );
								if ( protocol ) {
									this.setValue( url.substr( protocol[ 0 ].length ) );
									protocolCmb.setValue( protocol[ 0 ].toLowerCase() );
								} else if ( urlOnChangeTestOther.test( url ) ) {
									protocolCmb.setValue( '' );
								}

								this.allowOnChange = true;
							},
							onChange: function() {
								if ( this.allowOnChange ) // Dont't call on dialog load.
								this.onKeyUp();
							},
							validate: function() {
								var dialog = this.getDialog();

								if ( dialog.getContentElement( 'info', 'linkType' ) && dialog.getValueOf( 'info', 'linkType' ) != 'url' )
									return true;

								if ( !editor.config.linkJavaScriptLinksAllowed && ( /javascript\:/ ).test( this.getValue() ) ) {
									alert( commonLang.invalidValue ); // jshint ignore:line
									return false;
								}

								if ( this.getDialog().fakeObj ) // Edit Anchor.
								return true;
							},
							setup: function( data ) {
								this.allowOnChange = false;
								if ( data.url )
									this.setValue( data.url.url );
								this.allowOnChange = true;

							},
							commit: function( data ) {
								// IE will not trigger the onChange event if the mouse has been used
								// to carry all the operations #4724
								this.onChange();

								if ( !data.url )
									data.url = {};

								data.url.url = this.getValue();
								this.allowOnChange = false;
							}
						} ],
						setup: function() {
							if ( !this.getDialog().getContentElement( 'info', 'linkType' ) )
								this.getElement().show();
						}
					},
					{
						type: 'hbox',
						widths: [ '50%', '50%' ],
						children: [ {
							type: 'checkbox',
							id: 'linkTargetType',
							label: 'Open in new window',
							setup: function( data ) {
								if ( data.target ) {
									var val = data.target.type === 'notSet' ? false : true;
									this.setValue( val );
								}
							},
							commit: function( data ) {
								if ( !data.target )
									data.target = {};

								var type = this.getValue() ? '_blank' : 'notSet';
								data.target.type = type;
								data.target.name = type;
							}
						}, {
							type: 'button',
							id: 'upload',
							label: 'Upload document',
							style: 'float: right',
							onClick: function() {
								var dialog = this.getDialog();
								editor.config.uploadCallback(function(url) {
									var urlInput = dialog.getContentElement( 'info', 'url' );
									urlInput.setValue( url || '' );
								});
							}
						} ]
					} ]
				},
				{
					type: 'vbox',
					id: 'emailOptions',
					padding: 1,
					children: [ {
						type: 'text',
						id: 'emailAddress',
						label: linkLang.emailAddress,
						validate: function() {
							var dialog = this.getDialog();
							var emailRegex = /.+@.+/;

							if ( !dialog.getContentElement( 'info', 'linkType' ) || dialog.getValueOf( 'info', 'linkType' ) != 'email' )
								return true;

							if (!emailRegex.test( this.getValue() )) {
								alert('Invalid email address');
								return false;
							}
						},
						setup: function( data ) {
							if ( data.email )
								this.setValue( data.email.address );

							var linkType = this.getDialog().getContentElement( 'info', 'linkType' );
							if ( linkType && linkType.getValue() == 'email' )
								this.select();
						},
						commit: function( data ) {
							if ( !data.email )
								data.email = {};

							data.email.address = this.getValue();
						}
					},
					{
						type: 'text',
						id: 'emailSubject',
						label: linkLang.emailSubject,
						setup: function( data ) {
							if ( data.email )
								this.setValue( data.email.subject );
						},
						commit: function( data ) {
							if ( !data.email )
								data.email = {};

							data.email.subject = this.getValue();
						}
					},
					{
						type: 'textarea',
						id: 'emailBody',
						label: linkLang.emailBody,
						rows: 3,
						'default': '',
						setup: function( data ) {
							if ( data.email )
								this.setValue( data.email.body );
						},
						commit: function( data ) {
							if ( !data.email )
								data.email = {};

							data.email.body = this.getValue();
						}
					} ],
					setup: function() {
						if ( !this.getDialog().getContentElement( 'info', 'linkType' ) )
							this.getElement().hide();
					}
				} ]
			}],
			onShow: function() {
				var editor = this.getParentEditor(),
					selection = editor.getSelection(),
					element = null;

				// Fill in all the relevant fields if there's already one link selected.
				if ( ( element = plugin.getSelectedLink( editor ) ) && element.hasAttribute( 'href' ) ) {
					// Don't change selection if some element is already selected.
					// For example - don't destroy fake selection.
					if ( !selection.getSelectedElement() )
						selection.selectElement( element );
				} else {
					element = null;
				}

				var data = plugin.parseLinkAttributes( editor, element );

				// Record down the selected element in the dialog.
				this._.selectedElement = element;

				this.setupContent( data );
			},
			onOk: function() {
				var data = {};

				// Collect data from fields.
				this.commitContent( data );

				var selection = editor.getSelection(),
					attributes = plugin.getLinkAttributes( editor, data );

				if (data.type === 'email' && !data.email.address || data.type === 'url' && !data.url.url) {
					editor.execCommand('unlink');
					return;
				}

				if ( !this._.selectedElement ) {
					var range = selection.getRanges()[ 0 ];

					// Use link URL as text with a collapsed cursor.
					if ( range.collapsed ) {
						// Short mailto link text view (#5736).
						var text = new CKEDITOR.dom.text( data.type == 'email' ?
							data.email.address : attributes.set[ 'data-cke-saved-href' ], editor.document );
						range.insertNode( text );
						range.selectNodeContents( text );
					}

					// Apply style.
					var style = new CKEDITOR.style( {
						element: 'a',
						attributes: attributes.set
					} );

					style.type = CKEDITOR.STYLE_INLINE; // need to override... dunno why.
					style.applyToRange( range, editor );
					range.select();
				} else {
					// We're only editing an existing link, so just overwrite the attributes.
					var element = this._.selectedElement,
						href = element.data( 'cke-saved-href' ),
						textView = element.getHtml();

					element.setAttributes( attributes.set );
					element.removeAttributes( attributes.removed );

					// Update text view when user changes protocol (#4612).
					if ( href == textView || data.type == 'email' && textView.indexOf( '@' ) != -1 ) {
						// Short mailto link text view (#5736).
						element.setHtml( data.type == 'email' ?
							data.email.address : attributes.set[ 'data-cke-saved-href' ] );

						// We changed the content, so need to select it again.
						selection.selectElement( element );
					}

					delete this._.selectedElement;
				}
			},
			// Inital focus on 'url' field if link is of type URL.
			onFocus: function() {
				var linkType = this.getContentElement( 'info', 'linkType' ),
					urlField;

				if ( linkType && linkType.getValue() == 'url' ) {
					urlField = this.getContentElement( 'info', 'url' );
					urlField.select();
				}
			}
		};
	} );
} )();
// jscs:disable maximumLineLength
/**
 * The e-mail address anti-spam protection option. The protection will be
 * applied when creating or modifying e-mail links through the editor interface.
 *
 * Two methods of protection can be chosen:
 *
 * 1. The e-mail parts (name, domain, and any other query string) are
 *     assembled into a function call pattern. Such function must be
 *     provided by the developer in the pages that will use the contents.
 * 2. Only the e-mail address is obfuscated into a special string that
 *     has no meaning for humans or spam bots, but which is properly
 *     rendered and accepted by the browser.
 *
 * Both approaches require JavaScript to be enabled.
 *
 *		// href="mailto:tester@ckeditor.com?subject=subject&body=body"
 *		config.emailProtection = '';
 *
 *		// href="<a href=\"javascript:void(location.href=\'mailto:\'+String.fromCharCode(116,101,115,116,101,114,64,99,107,101,100,105,116,111,114,46,99,111,109)+\'?subject=subject&body=body\')\">e-mail</a>"
 *		config.emailProtection = 'encode';
 *
 *		// href="javascript:mt('tester','ckeditor.com','subject','body')"
 *		config.emailProtection = 'mt(NAME,DOMAIN,SUBJECT,BODY)';
 *
 * @since 3.1
 * @cfg {String} [emailProtection='' (empty string = disabled)]
 * @member CKEDITOR.config
 */

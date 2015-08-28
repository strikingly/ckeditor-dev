#!/bin/bash

cp -f custom/icons_hidpi.png custom/fontfamily.png release/ckeditor/plugins
sed -Ei '' 's|background:url\(icons_hidpi\.png\)|background:url(/assets/ckeditor/plugins/icons_hidpi.png)|g' release/ckeditor/skins/clean/editor*.css
sed -Ei '' 's|background:url\(icons\.png\)|background:url(/assets/ckeditor/plugins/icons.png)|g' release/ckeditor/skins/clean/editor*.css
cat release/ckeditor/lang/en.js release/ckeditor/styles.js >>release/ckeditor/ckeditor.js
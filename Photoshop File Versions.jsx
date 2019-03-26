// Photoshop File Versions.jsx 1.8.
// Former name: Auto Save PSD.jsx
// Author: Joonas Pääkkö
// https://github.com/joonaspaakko/Photoshop-file-versions-script

// Changelog:
// ==========

// 1.8.
// - Now you can change the settings without having to open the script file and changing variables. Just run the script with no documents open and you get the settings dialog.

// 1.7.1
// - Due to human error, the last commit contained only part of the code meant to go online and wasn't really working properly.

// 1.7.
// - Added: PNG & JPG export option. Variable name: "additionalExport".

// 1.6.
// - Change: versions folder name by including .psd extension. Sorting is a bit better like this.
// - Change: I deemed that because of the description, it's better if version numbers are in the front. That way random numbers are not going to give you trouble.
// - Added: a variable "useDocName" so you can choose to go with just the description or just the number.

// 1.5.
// - Removed: No need for the PS Action anymore.
// - Fix: File naming now works by finding the largest number. Meaning you can now rename or delete files in the versions folder without weird jumps in numbers.
// - Added: Optional alert that shows the name of the saved file. With this you can make a mental note of which version was which. Set variable 'notify' = false if you dont' want that.
// - Added: Optional prompt for adding a small description in the filename. Can be disabled by setting the variable "shortDescription" = false;
// - Change: Renamed the save folder.

// 1.4.
// - Fix: File naming now uses the number of files in the save folde
// - Change: Renamed the save folder.

#target photoshop

var settings = {
	notify            : true, // Boolean. Shows the newly saved verions full filename after saving.
	useDocName        : true, // Boolean. You can use this to get more room for the description.
	shortDescription  : true, // Boolean. A prompt where use can describe changes briefly. Leaving the description empty does the same thing as canceling.
	versionsFolderName: ' (Versions)', // String. This is a suffix for the versions folder: "My Document.psd (Versions)".
	additionalExport  : 0 // 0 = false, 1 = jpeg, 2 = png
};


json();

var settingsFile = new File($.fileName);
var settingsPath = settingsFile.parent + "/" + settingsFile.name.substring(0, settingsFile.name.lastIndexOf('.')) + ".json";

var settingsJSON = readFile( settingsPath );
if ( app.documents.length > 0 ) {
	if ( settingsJSON ) settings = settingsJSON;
}
else {
	noDocsDialog( settingsJSON ? settingsJSON : settings );
}

try {
	
  var doc   = app.activeDocument;
	var fileExists = false;
	
	try {
		fileExists = doc.path;
		// Cmd+S
		doc.save();
	}
	// Cmd+Shift+S
	catch(e){
		var idsave = charIDToTypeID( "save" );
		var desc50 = new ActionDescriptor();
		var idIn = charIDToTypeID( "In  " );
		desc50.putPath( idIn, new File( Folder.desktop.fullName ) );
		var idDocI = charIDToTypeID( "DocI" );
		desc50.putInteger( idDocI, 196 );
		var idsaveStage = stringIDToTypeID( "saveStage" );
		var idsaveStageType = stringIDToTypeID( "saveStageType" );
		var idsaveSucceeded = stringIDToTypeID( "saveSucceeded" );
		desc50.putEnumerated( idsaveStage, idsaveStageType, idsaveSucceeded );
		executeAction( idsave, desc50, DialogModes.ALL );
		fileExists = doc.path;
	}
	
	// If the root file hasn't been saved, then don't save the new version either...
	if ( fileExists ) {
		saveNewVersion( doc );
	}

}
catch( e ) {
	
  // remove comments below to see error for debugging
  // alert( e );
	
}

function saveNewVersion( doc, docName ) {

  var psd         = '.psd';
  var docName     = doc.name.substring(0, doc.name.lastIndexOf('.'));
  var docPath     = doc.path;
	
  var outputPath = docPath + '/' + doc.name + settings.versionsFolderName;
	
  // If output folder doesn't exist, make one.
  var outputFolder = new Folder( outputPath );
  if( !outputFolder.exists ) { outputFolder.create(); }
	
  // Get list of all the current auto saved files
  var verisonsList = outputFolder.getFiles( '*' + psd );
	var versionsLength1 = verisonsList.length;
	var number = getVersionNumber( verisonsList );
	
	var descPrompt = null;
	if ( settings.shortDescription ) {
		descPrompt = prompt("Short description:", "");
		if ( descPrompt ) {
			var descSpace = settings.useDocName ? ' ' : '';
			var descParenthesis = [ settings.useDocName ? '(' : '', settings.useDocName ? ')' : '' ];
			settings.shortDescription = descSpace + descParenthesis[0] + descPrompt + descParenthesis[1];
		}
		else {
			settings.shortDescription = '';
		}
	}
	else {
		settings.shortDescription = '';
	}
	
  var psd_Opt               = new PhotoshopSaveOptions();
  psd_Opt.layers            = true; // Preserve layers.
  psd_Opt.embedColorProfile = true; // Preserve color profile.
  psd_Opt.annotations       = true; // Preserve annonations.
  psd_Opt.alphaChannels     = true; // Preserve alpha channels.
  psd_Opt.spotColors        = true; // Preserve spot colors.
	
  // Save active document in the Auto Save folder
	var divider = (settings.useDocName || descPrompt) ? ' - ' : '';
	var filename = 'v' + number + divider + (settings.useDocName ? docName : '') + settings.shortDescription;
  doc.saveAs( File( outputPath + '/' + filename + psd ), psd_Opt, true );

	
	var verisonsList = outputFolder.getFiles( '*' + psd );
	var versionsLength2 = verisonsList.length;

	if ( versionsLength1 < versionsLength2 ) {
		
		if ( settings.additionalExport ) {
			var extension = settings.additionalExport === 1 ? '.jpg' : '.png';
			doc.exportDocument( File( outputPath + '/' + filename + extension ), ExportType.SAVEFORWEB, exportOptions( extension ) );
			var exportedFile = new File( outputPath + '/' + filename.split(' ').join('-') + extension );
			exportedFile.rename( filename + extension );
		}
	
	  app.beep();
	}
	
	if ( settings.notify ) {
		if ( versionsLength1 < versionsLength2 ) {
			alert( 'File version saved: \n '+ filename );
		}
		else if ( versionsLength1 >= versionsLength2 ) {
			alert( 'Oopsies... File was not saved correctly' );
		}
	}

}

function getVersionNumber( verisonsList ) {
	
	var number = 0;
	for ( var i = 0; i < verisonsList.length; i++ ) {
		
		var file = verisonsList[i];
		var fileName = File(file).displayName;
		fileName = fileName.substring(0, fileName.lastIndexOf('.'));
		
		// Start looking for the version number if PSD filename contains doc name...
		var versionNumber = fileName.match(/^v[0-9]*/);
		
		if ( versionNumber ) {
			versionNumber = versionNumber[0].replace('v','');
			versionNumber = parseInt( versionNumber ,10);
			if ( number < versionNumber ) {
				number = versionNumber;
			}
		}
		
	}
	
	return number + 1;
	
}

function exportOptions( format ) {
	
	var options = new ExportOptionsSaveForWeb();
	
	options.format = format.toLowerCase() === 'png' ? SaveDocumentType.PNG : SaveDocumentType.JPEG;
	options.optimized	= true;
	options.quality = 100;
	options.matteColor = new RGBColor();
	options.matteColor.red = 255;
	options.matteColor.green = 255;
	options.matteColor.blue = 255;
	
	return options;
	
}

function noDocsDialog( settingsJSON ) {
	
	/*
	Code for Import https://scriptui.joonas.me — (Triple click to select):
	{"activeId":4,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"varName":null,"text":"Photoshop File Versions.jsx","preferredSize":[0,0],"margins":33,"orientation":"column","spacing":15,"alignChildren":["fill","top"]}},"item-1":{"id":1,"type":"Checkbox","parentId":0,"style":{"varName":"notifyCheckbox","text":"Notify","preferredSize":[0,0],"alignment":null}},"item-2":{"id":2,"type":"Checkbox","parentId":0,"style":{"varName":"descriptionCheckbox","text":"Short description","preferredSize":[0,0],"alignment":null}},"item-3":{"id":3,"type":"Checkbox","parentId":0,"style":{"varName":"docNameCheckbox","text":"Use document name","preferredSize":[0,0],"alignment":null}},"item-4":{"id":4,"type":"DropDownList","parentId":0,"style":{"varName":"additionalExportDropdown","text":"Additional export","listItems":"FALSE, JPEG, PNG","preferredSize":[0,0],"alignment":null,"selection":0}},"item-5":{"id":5,"type":"Group","parentId":0,"style":{"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-6":{"id":6,"type":"StaticText","parentId":5,"style":{"varName":null,"text":"Versions folder suffix:","justify":"left","preferredSize":[0,0],"alignment":null}},"item-7":{"id":7,"type":"EditText","parentId":5,"style":{"varName":"versionsFolderInput","text":" (Versions)","preferredSize":[98,0],"alignment":null}},"item-8":{"id":8,"type":"Group","parentId":0,"style":{"varName":null,"preferredSize":[0,0],"margins":[26,0,0,0],"orientation":"row","spacing":10,"alignChildren":["center","center"],"alignment":null}},"item-9":{"id":9,"type":"Button","parentId":8,"style":{"varName":"btnSave","text":"Save Settings","justify":"center","preferredSize":[0,0],"alignment":null}},"item-10":{"id":10,"type":"Button","parentId":8,"style":{"varName":"btnCancel","text":"Cancel","justify":"center","preferredSize":[0,0],"alignment":null}},"item-11":{"id":11,"type":"Divider","parentId":0,"style":{"varName":null}},"item-12":{"id":12,"type":"Divider","parentId":0,"style":{"varName":null}}},"order":[0,1,2,3,12,5,6,7,4,11,8,10,9]}
	*/

	// DIALOG
	// ======
	var dialog = new Window("dialog");
	    dialog.text = "Photoshop File Versions.jsx";
	    dialog.orientation = "column";
	    dialog.alignChildren = ["fill","top"];
	    dialog.spacing = 15;
	    dialog.margins = 33;

	var notifyCheckbox = dialog.add("checkbox");
	    notifyCheckbox.text = "Notify";

	var descriptionCheckbox = dialog.add("checkbox");
	    descriptionCheckbox.text = "Short description";

	var docNameCheckbox = dialog.add("checkbox");
	    docNameCheckbox.text = "Use document name";

	var divider1 = dialog.add("panel");
	    divider1.alignment = "fill";

	// GROUP1
	// ======
	var group1 = dialog.add("group");
	    group1.orientation = "row";
	    group1.alignChildren = ["left","center"];
	    group1.spacing = 10;
	    group1.margins = 0;

	var statictext1 = group1.add("statictext");
	    statictext1.text = "Versions folder suffix:";

	var versionsFolderInput = group1.add("edittext");
	    versionsFolderInput.text = " (Versions)";
	    versionsFolderInput.preferredSize.width = 98;

	// DIALOG
	// ======
	var additionalExportDropdown_array = ["FALSE","JPEG","PNG"];
	var additionalExportDropdown = dialog.add("dropdownlist", undefined, additionalExportDropdown_array);
	    additionalExportDropdown.selection = 0;
	    additionalExportDropdown.text = "Additional export";

	var divider2 = dialog.add("panel");
	    divider2.alignment = "fill";

	// GROUP2
	// ======
	var group2 = dialog.add("group");
	    group2.orientation = "row";
	    group2.alignChildren = ["center","center"];
	    group2.spacing = 10;
	    group2.margins = [0,26,0,0];

	var btnCancel = group2.add("button", undefined, undefined, {name: "cancel"});
	    btnCancel.text = "Cancel";
	    btnCancel.justify = "center";

	var btnSave = group2.add("button", undefined, undefined, {name: "ok"});
	    btnSave.text = "Save Settings";
	    btnSave.justify = "center";
	
	// ####### CUSTOMIZATION #######
	
	if ( settingsJSON ) {
		notifyCheckbox.value      = settingsJSON.notify;
		docNameCheckbox.value     = settingsJSON.useDocName;
		descriptionCheckbox.value = settingsJSON.shortDescription;
		versionsFolderInput.text  = settingsJSON.versionsFolderName
		additionalExportDropdown.selection = settingsJSON.additionalExport;
	}
	
	btnSave.onClick = function() {
		
		var settings = {
			notify            : notifyCheckbox.value,
			useDocName        : docNameCheckbox.value,
			shortDescription  : descriptionCheckbox.value,
			versionsFolderName: versionsFolderInput.text,
			additionalExport  : additionalExportDropdown.selection.index
		};
		settingsJSON = JSON.stringify( settings );
		
		writeFile( settingsPath, settingsJSON );
		dialog.hide();
		
	}
	btnCancel.onClick = function() {
		dialog.hide();
	}
	
	dialog.show();
	
}


function writeFile( filePath, json ) {
	
	var file = new File( filePath );
	file.open('w');
	file.writeln( json );
	file.close();
	
}
function readFile( filePath ) {
	
	var file = new File( filePath ),
	fileOpen = file.open('r');
	var json = file.readln();
	file.close();
	
	return !fileOpen ? false : JSON.parse( json );
	
}

function json() {
	
	"object"!=typeof JSON&&(JSON={}),function(){"use strict";var rx_one=/^[\],:{}\s]*$/,rx_two=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,rx_three=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,rx_four=/(?:^|:|,)(?:\s*\[)+/g,rx_escapable=/[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,rx_dangerous=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta,rep;function f(t){return t<10?"0"+t:t}function this_value(){return this.valueOf()}function quote(t){return rx_escapable.lastIndex=0,rx_escapable.test(t)?'"'+t.replace(rx_escapable,function(t){var e=meta[t];return"string"==typeof e?e:"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+t+'"'}function str(t,e){var r,n,o,u,f,a=gap,i=e[t];switch(i&&"object"==typeof i&&"function"==typeof i.toJSON&&(i=i.toJSON(t)),"function"==typeof rep&&(i=rep.call(e,t,i)),typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i)return"null";if(gap+=indent,f=[],"[object Array]"===Object.prototype.toString.apply(i)){for(u=i.length,r=0;r<u;r+=1)f[r]=str(r,i)||"null";return o=0===f.length?"[]":gap?"[\n"+gap+f.join(",\n"+gap)+"\n"+a+"]":"["+f.join(",")+"]",gap=a,o}if(rep&&"object"==typeof rep)for(u=rep.length,r=0;r<u;r+=1)"string"==typeof rep[r]&&(o=str(n=rep[r],i))&&f.push(quote(n)+(gap?": ":":")+o);else for(n in i)Object.prototype.hasOwnProperty.call(i,n)&&(o=str(n,i))&&f.push(quote(n)+(gap?": ":":")+o);return o=0===f.length?"{}":gap?"{\n"+gap+f.join(",\n"+gap)+"\n"+a+"}":"{"+f.join(",")+"}",gap=a,o}}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},Boolean.prototype.toJSON=this_value,Number.prototype.toJSON=this_value,String.prototype.toJSON=this_value),"function"!=typeof JSON.stringify&&(meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},JSON.stringify=function(t,e,r){var n;if(indent=gap="","number"==typeof r)for(n=0;n<r;n+=1)indent+=" ";else"string"==typeof r&&(indent=r);if((rep=e)&&"function"!=typeof e&&("object"!=typeof e||"number"!=typeof e.length))throw new Error("JSON.stringify");return str("",{"":t})}),"function"!=typeof JSON.parse&&(JSON.parse=function(text,reviver){var j;function walk(t,e){var r,n,o=t[e];if(o&&"object"==typeof o)for(r in o)Object.prototype.hasOwnProperty.call(o,r)&&(void 0!==(n=walk(o,r))?o[r]=n:delete o[r]);return reviver.call(t,e,o)}if(text=String(text),rx_dangerous.lastIndex=0,rx_dangerous.test(text)&&(text=text.replace(rx_dangerous,function(t){return"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})),rx_one.test(text.replace(rx_two,"@").replace(rx_three,"]").replace(rx_four,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}();

}

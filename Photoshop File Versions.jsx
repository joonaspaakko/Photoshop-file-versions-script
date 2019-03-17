// Photoshop File Versions.jsx 1.7.1
// Former name: Auto Save PSD.jsx
// Author: Joonas Pääkkö
// https://github.com/joonaspaakko/Photoshop-file-versions-script

// Changelog:
// ==========

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

// OPTIONS:
var notify             = true; // Boolean. Shows the newly saved verions full filename after saving.
var shortDescription   = true; // Boolean. A prompt where use can describe changes briefly. Leaving the description empty does the same thing as canceling.
var useDocName         = true; // Boolean. You can use this to get more room for the description.
var versionsFolderName = ' (Versions)'; // String. This is a suffix for the versions folder: "My Document.psd (Versions)".
var additionalExport   = false; // Accepted values: false, 'jpg', 'png'

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
	
  var outputPath = docPath + '/' + doc.name + versionsFolderName;
	
  // If output folder doesn't exist, make one.
  var outputFolder = new Folder( outputPath );
  if( !outputFolder.exists ) { outputFolder.create(); }
	
  // Get list of all the current auto saved files
  var verisonsList = outputFolder.getFiles( '*' + psd );
	var versionsLength1 = verisonsList.length;
	var number = getVersionNumber( verisonsList );
	
	var descPrompt = null;
	if ( shortDescription ) {
		descPrompt = prompt("Short description:", "");
		if ( descPrompt ) {
			var descSpace = useDocName ? ' ' : '';
			var descParenthesis = [ useDocName ? '(' : '', useDocName ? ')' : '' ];
			shortDescription = descSpace + descParenthesis[0] + descPrompt + descParenthesis[1];
		}
		else {
			shortDescription = '';
		}
	}
	else {
		shortDescription = '';
	}
	
  var psd_Opt               = new PhotoshopSaveOptions();
  psd_Opt.layers            = true; // Preserve layers.
  psd_Opt.embedColorProfile = true; // Preserve color profile.
  psd_Opt.annotations       = true; // Preserve annonations.
  psd_Opt.alphaChannels     = true; // Preserve alpha channels.
  psd_Opt.spotColors        = true; // Preserve spot colors.
	
  // Save active document in the Auto Save folder
	var divider = (useDocName || descPrompt) ? ' - ' : '';
	var filename = 'v' + number + divider + (useDocName ? docName : '') + shortDescription;
  doc.saveAs( File( outputPath + '/' + filename + psd ), psd_Opt, true );

	
	var verisonsList = outputFolder.getFiles( '*' + psd );
	var versionsLength2 = verisonsList.length;

	if ( versionsLength1 < versionsLength2 ) {
		
		if ( additionalExport ) {
			var extension = additionalExport === 'png' ? '.png' : '.jpg';
			doc.exportDocument( File( outputPath + '/' + filename + extension ), ExportType.SAVEFORWEB, exportOptions( additionalExport ) );
			var exportedFile = new File( outputPath + '/' + filename.split(' ').join('-') + extension );
			exportedFile.rename( filename + extension );
		}
	
	  app.beep();
	}
	
	if ( notify ) {
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

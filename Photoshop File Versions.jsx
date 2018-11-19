// Auto Save PSD.jsx 1.5.
// Author: Joonas Pääkkö
// https://github.com/joonaspaakko/Photoshop-file-versions-script

// Changelog:
// ==========

// 1.5.
// - Removed: No need for the PS Action anymore.
// - Fix: File naming now works by finding the largest number. Meaning you can now rename or delete files in the ()
// - Added: Optional alert that shows the name of the saved file. With this you can make a mental note of which version was which. Set variable 'notify' = false if you dont' want that.
// - Added: Optional prompt for adding a small description in the filename. Can be disabled by setting the variable "shortDescription" = false;
// - Change: Renamed the save folder.

// 1.4.
// - Fix: File naming now uses the number of files in the save folde
// - Change: Renamed the save folder.

#target photoshop

var notify = true; // Boolean.
var shortDescription = true; // Boolean. A prompt where use can describe changes briefly.
var versionsFolderName = ' (Versions)'; // String.

try {

  var doc   = app.activeDocument;
	
	// Cmd+S
	try {
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
	}
	
	// If the root file isn't saved, then don't save the new version either...
	if ( doc.saved ) {
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
  var verisonsList = outputFolder.getFiles( docName + '*' + psd );
	var suffix = getVersionNumber( verisonsList );
	
	if ( shortDescription ) {
		var descPrompt = prompt("Short description:", "");
		if ( descPrompt ) {
			shortDescription = '('+ descPrompt + ') ';
		}
		else {
			shortDescription = '';
		}
	}

  // Options for the soon to be Auto Saved PSD file
  var psd_Opt               = new PhotoshopSaveOptions();
  psd_Opt.layers            = true; // Preserve layers.
  psd_Opt.embedColorProfile = true; // Preserve color profile.
  psd_Opt.annotations       = true; // Preserve annonations.
  psd_Opt.alphaChannels     = true; // Preserve alpha channels.
  psd_Opt.spotColors        = true; // Preserve spot colors.
	
  // Save active document in the Auto Save folder
  doc.saveAs( File( outputPath + '/' + docName + ' ' + shortDescription + suffix + psd ), psd_Opt, true );

  app.beep();
	
	if ( notify ) {
		alert( 'Version saved: \n '+ docName + ' ' + shortDescription + suffix + psd );
	}

}

function getVersionNumber( verisonsList ) {
	
	var os = $.os;
	
	var suffix = 0;
	for ( var i = 0; i < verisonsList.length; i++ ) {
		
		var file = verisonsList[i];
		var fileName = File(file).displayName;
		var fn = fileName.substring(0, fileName.lastIndexOf('.'));
		var versionNumber = fn.match(/[0-9]+$/);
		
		if ( versionNumber ) {
			versionNumber = parseInt( versionNumber, 10);
			if ( suffix < versionNumber ) {
				suffix = versionNumber;
			}
		}
		
	}
	
	return suffix + 1;
	
}

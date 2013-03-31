// (c) Copyright 2005.  Adobe Systems, Incorporated.  All rights reserved.

/*
@@@BUILDINFO@@@ Auto Save PSD.jsx 1.0
*/

var begDesc = "$$$/JavaScripts/AutoSavePSD/Description=This script is designed to be used as a script that runs after a save event. The script will save a copy of the current PSD document in a new folder ( current_filename_autoSave ) next to the current active document." // endDesc
var begName = "$$$/JavaScripts/AutoSavePSD/MenuName=Auto Save PSD" // endName

// on localized builds we pull the $$$/Strings from a .dat file, see documentation for more details
$.localize = true;

try {

    if ( UsingAsACopy( arguments[0] ) ) {
        alert(  localize( '$$$/JavaScripts/AutoSavePSDWarning=Save used As A Copy, extra file may not save correctly.' ) );
    }

    if ( IsBeginSaveEvent( arguments[0] ) ) {
        alert(  localize( '$$$/JavaScripts/AutoSavePSDError=Auto Save PSD should only be used with the Save Document event and not the Start Save Document event.^rAuto Save PSD aborted!' ) );
        throw( "DONE" );
    }

    var doc = activeDocument;
    var data = GetDataFromDocument( doc );

    if ( data.extension.toLowerCase() == 'psd' ) {
        AutoSavePSD( data );
    }

} // try end

catch( e ) {
    // always wrap your script with try/catch blocks so you don't stop production
    // remove comments below to see error for debugging
    // alert( e );
}


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// Function: AutoSavePSD
// Use: save the current document as a copy
// Input: a document must be active
// Params: folder, filename, extension
// Output: file saved as a copy next to the current active document
///////////////////////////////////////////////////////////////////////////////
function AutoSavePSD( data ) {

        // Save as .psd
        var psd_Opt = new PhotoshopSaveOptions();
        psd_Opt.layers = true; // Preserve layers.
        psd_Opt.embedColorProfile = true; // Preserve color profile.
        psd_Opt.annotations = true; // Preserve annonations.
        psd_Opt.alphaChannels = true; // Preserve alpha channels.

        var psd_Extension = '.psd';
        if ( "" == data.extension ) {
            psd_Extension = "";
        }

        // Excuse me sir. What time is it? ...where am I?
        var time = new Date();
        var seconds = time.getSeconds();
        var sec = seconds < 10 ? '0' + seconds : seconds;
        var minutes = time.getMinutes();
        var min = minutes < 10 ? '0' + minutes : minutes;
        var hours = time.getHours();
        var hour = hours < 10 ? '0' + hours : hours;
        var day = time.getDate();
        var dd = day < 10 ? '0' + day : day;
        var month = time.getMonth() + 1;
        var mm = month < 10 ? '0' + month : month;
        var yyyy = time.getFullYear();

        date =  yyyy + '-' + mm + '-' + dd + '-' + hour + '-' + min + '-' + sec;

        // New folder for the auto saves...
        var asFolder = new Folder( data.folder + '/' + data.fileName + '_autoSave/');
        if( !asFolder.exists ) asFolder.create();

        // Save document as....
        activeDocument.saveAs( File( data.folder + '/' + data.fileName + '_autoSave/' + data.fileName + ' ' + date + psd_Extension ), psd_Opt, true );

}

///////////////////////////////////////////////////////////////////////////////
// Function: UsingAsACopy
// Use: find out if the user used 'As A Copy'
// Input: action descriptor from the event that just occured
// Output: boolean that 'As A Copy' was checked
// Note: On script events the script gets passed in the actual action that
// occured we can look inside the action descriptor and pull information out
// in this case we are looking for the keyCopy
///////////////////////////////////////////////////////////////////////////////
function UsingAsACopy( actionDescriptor ) {
    var usingKeyCopy = false;
    if ( undefined != actionDescriptor ) {
        if ( "ActionDescriptor" == actionDescriptor.typename ) {
            var keyCopy = charIDToTypeID( "Cpy " );
            if ( actionDescriptor.hasKey( keyCopy ) ) {
                usingKeyCopy = actionDescriptor.getBoolean( keyCopy );
            }
        }
    }
    return usingKeyCopy;
}

///////////////////////////////////////////////////////////////////////////////
// Function: IsBeginSaveEvent
// Use: find out if the user used 'Start Save Document' event
// Input: action descriptor from the event that just occured
// Output: boolean that this is the 'Start Save Event' is occuring
// Note: On script events the script gets passed in the actual action that
// occured we can look inside the action descriptor and pull information out
// in this case we are looking for the "saveStage" to not be "saveBegin"
///////////////////////////////////////////////////////////////////////////////
function IsBeginSaveEvent( actionDescriptor ) {
    var usingStartSave = false;
    if ( undefined != actionDescriptor ) {
        if ( "ActionDescriptor" == actionDescriptor.typename ) {
            var keySaveStage = stringIDToTypeID( "saveStage" );
            if ( actionDescriptor.hasKey( keySaveStage ) ) {
                var typeSaveStage = actionDescriptor.getEnumerationType( keySaveStage );
                 var typeSaveStageType = stringIDToTypeID( "saveStageType" );
                 var enumSaveStage = actionDescriptor.getEnumerationValue( keySaveStage );
                 var enumSaveStageBegin = stringIDToTypeID( "saveBegin" );
                 usingStartSave = enumSaveStage == enumSaveStageBegin && typeSaveStage == typeSaveStageType;
            }
        }
    }
    return usingStartSave;
}

///////////////////////////////////////////////////////////////////////////////
// Function: GetDataFromDocument
// Usage: pull data about the document passed in
// Input: document to gather data
// Output: Object containing folder, fileName, fileType, extension
///////////////////////////////////////////////////////////////////////////////
function GetDataFromDocument( inDocument ) {
    var data = new Object();
    var fullPathStr = inDocument.fullName.toString();
    var lastDot = fullPathStr.lastIndexOf( "." );
    var fileNameNoPath = fullPathStr.substr( 0, lastDot );
    data.extension = fullPathStr.substr( lastDot + 1, fullPathStr.length );
    var lastSlash = fullPathStr.lastIndexOf( "/" );
    data.fileName = fileNameNoPath.substr( lastSlash + 1, fileNameNoPath.length );
    data.folder = fileNameNoPath.substr( 0, lastSlash );
    data.fileType = inDocument.fullName.type;
    return data;
}

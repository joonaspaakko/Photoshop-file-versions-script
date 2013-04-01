// (c) Copyright 2005.  Adobe Systems, Incorporated.  All rights reserved.

// Auto Save PSD.jsx 1.3.
// This file was modified out of "Save Extra JPEG.jsx".
// Modifications by Joonas Pääkkö
// https://github.com/joonaspaakko

/*

    <javascriptresource>
    <name>$$$/JavaScripts/AutoSavePSD/Menu=Auto Save PSD</name>
    <category>Auto Save</category>
    <enableinfo>true</enableinfo>
    <eventid>64feff0a-8271-436f-8c59-d2105497d902</eventid>
    </javascriptresource>

*/

// enable double clicking from the Macintosh Finder or the Windows Explorer
#target photoshop

// on localized builds we pull the $$$/Strings from a .dat file, see documentation for more details
$.localize = true;

try {

    // Get the currently active document.
    var doc = app.activeDocument;

    // If document has been saved once...
    if ( doc.saved ) {
        // One document save is needed so that we know where to save the psd.
        doc.save();
    }
    // Document has not been saved yet...
    else {

        // An action is triggered to prompt save as dialog.
        // You'd think that this would be easy to do, but I
        // couldn't figure out a better way for doing this.
        app.doAction('save','Auto Save PSD');

    }

    // Save additional psd file...
    var data = GetDataFromDocument( doc );
    AutoSavePSD( doc, data );



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
function AutoSavePSD( doc, data ) {


        // Save as .psd
        var psd_Opt = new PhotoshopSaveOptions();
        psd_Opt.layers = true; // Preserve layers.
        psd_Opt.embedColorProfile = true; // Preserve color profile.
        psd_Opt.annotations = true; // Preserve annonations.
        psd_Opt.alphaChannels = true; // Preserve alpha channels.

         // Excuse me sir. What time is it? ...where am I?
        var time                      = new Date();
        var seconds                   = time.getSeconds();
        var sec                       = seconds < 10 ? '0' + seconds : seconds;
        var minutes                   = time.getMinutes();
        var min                       = minutes < 10 ? '0' + minutes : minutes;
        var hours                     = time.getHours();
        var hour                      = hours < 10 ? '0' + hours : hours;
        var day                       = time.getDate();
        var dd                        = day < 10 ? '0' + day : day;
        var month                     = time.getMonth() + 1;
        var mm                        = month < 10 ? '0' + month : month;
        var yyyy                      = time.getFullYear();
        var date                      =  yyyy + '-' + mm + '-' + dd + '-' + hour + '-' + min + '-' + sec;

        // New folder for the auto saves...
        var fileName                  = data.fileName;
        var folderPath                = data.folder + '/' + fileName + ' (-autoSave-)/';
        var asFolder                  = new Folder( folderPath );

        // If folder doesn't exist, let's create one.
        if( !asFolder.exists ) asFolder.create();

        // Creates the additional .psd file.
        doc.saveAs( File( folderPath + fileName + ' ' + date + '.psd' ), psd_Opt, true );
}

///////////////////////////////////////////////////////////////////////////////
// Function: GetDataFromDocument
// Usage: pull data about the document passed in
// Input: document to gather data
// Output: Object containing folder, fileName, fileType, extension
///////////////////////////////////////////////////////////////////////////////
function GetDataFromDocument( inDocument ) {

    var data           = new Object();
    var fullPathStr    = inDocument.fullName.toString();
    var lastDot        = fullPathStr.lastIndexOf( "." );
    var fileNameNoPath = fullPathStr.substr( 0, lastDot );
    var lastSlash      = fullPathStr.lastIndexOf( "/" );

    data.extension     = fullPathStr.substr( lastDot + 1, fullPathStr.length );
    data.fileName      = fileNameNoPath.substr( lastSlash + 1, fileNameNoPath.length );
    data.folder        = fileNameNoPath.substr( 0, lastSlash );
    data.fileType      = inDocument.fullName.type;

    return data;

}

/**
 * A simple CIF (Crystallographic Information File) reader.
 *
 * A friend sent me this description (sorry for german language):
 * --- BEGIN mail ---
 * [...] findest du anbei. Das Format ist standardisiert; es handelt sich dabei
 * um einen Spezialfall des STAR-Formats.
 * Das Wörterbuch dazu findest du auf:
 * http://www.iucr.org/resources/cif/dictionaries/cif_core
 * Die genaue Spezifikation ist hier niedergelegt, aber eher von geringerem
 * Interesse: http://www.iucr.org/resources/cif/spec/version1.1
 * Für CIFs gibt es schon fertige Parser in allerlei Sprachen, falls dir
 * das hilft. Unter Punkt 3 hier eine Liste:
 * http://www.iucr.org/resources/cif/software/#3
 *
 * In der Beispieldatei interessant sind allein die folgenden Daten:
 * 
 * _cell_length_a                   11.1848(4)
 * _cell_length_b                   9.9247(5)
 * _cell_length_c                   18.7364(8)
 * _cell_angle_alpha                90.00
 * _cell_angle_beta                 93.368(4)
 * _cell_angle_gamma                90.00
 * 
 * (Die Längen der Seiten der Zelle in Angström und die Winkel zwischen den
 * Seiten in Grad.)
 *
 * loop_
 * _atom_site_label
 * _atom_site_type_symbol
 * _atom_site_fract_x
 * _atom_site_fract_y
 * _atom_site_fract_z
 * 
 * C11 C 0.8223(3) 0.1202(3) 0.28964(16)
 * C12 C 0.8022(3) 0.1002(4) 0.36106(17)
 * H12 H 0.8466 0.1489 0.3973 0.044
 * ...
 * 
 * Dabei sind nur Label und die Fract-Koordinaten von Interesse, das
 * Typensymbol ist egal. Sie geben den Namen des Atoms sowie die die Lage
 * auf der jeweiligen Koordinate (von -1 bis +1) an. Z. B. würde C11 in
 * absoluter Länge 9.197(4) A (0.8223 * Zellenlänge a) vom Ursprung
 * entfernt bezüglich der a-Achse liegen. Die Zahl in Klammern ist übrigens
 * der Fehler. 0.8223(3) bedeutet (0.8223 ± 0.0003).
 * 
 * Das Oktaeder würde in den Beispieldaten von N10, N20, N30, N41, Cl1 und
 * Cl2 aufgespannt. Zentralatom wäre Co1.
 * --- END mail ---
 *
 * @author  Ikaros Kappler
 * @date    2015-03-23
 * @version 1.0.0
 **/

var CIFFileReader = {};

//window.alert( IKRS.CIFFileReader );

/**
 * Pass an <input type="file" /> object.
 **/
/*
CIFFileReader.readFiles = function( fileDOMElement, callbackOK, callbackError ) {

    //window.alert( fileDOMElement );
    
    var resultSet = [];
    for( var i = 0; i < fileDOMElement.files.length; i++ ) {
	//window.alert( fileDOMElement.files[i].name );
	
	var result = CIFFileReader.readFile( fileDOMElement.files[i],
					     function( r ) { resultSet.push(r); },
					     callbackError
					   );
	//window.alert( "Result[" + i +"]=" + JSON.stringify(result) );
	//resultSet.push( result );
    }

    return resultSet;
};
*/

CIFFileReader.readFile = function( fileObject, callbackOK, callbackError ) {

    var reader = new FileReader();
    reader.parser = this;
    reader.onload = function( e ) {

	try {
	    //this.parser.parseOpenSCADData( e.target.result );
	    callbackOK( CIFFileReader.parseCIFData( e.target.result, fileObject.name ) );
	    
	} catch( e ) {
	    var errmsg = "Error: " + e;
	    console.log( errmsg );
	    //throw errmsg;
	    callbackError( errmsg );
	}
	
    };
    reader.onprogress = function( e ) {
	// NOOP
	// (display progress?)
    };
    reader.onerror = function( e ) {
	var errmsg = "File upload error (code=" + e.target.error.code + ").";
	console.log( errmsg );
	throw errmsg;
    };
    reader.readAsBinaryString( fileObject );

};

CIFFileReader.parseCIFData = function( data, filename ) {

    var result = { filename    : "x", //filename,
		   name        : null,
		   loopTables  : [],
		   globals     : []
		 };
    result.locateLoopTable = function( header, partialMatch ) {
	for( var i = 0; i < this.loopTables.length; i++ ) {
	    if( !partialMatch && this._compareArrays(this.loopTables[i].header,header) )
		return i;
	    if( partialMatch && this._arrayContainsArray(this.loopTables[i].header, header) )
		return i;
	}
	return -1; // Not found
    };
    result._compareArrays = function( a, b ) {
	// if the other array is a falsy value, return
	if ( !a || !b)
            return false;

	// compare lengths - can save a lot of time 
	if (a.length != b.length)
            return false;

	for (var i = 0, l=a.length; i < l; i++) {
            // Check if we have nested arrays
            if (a[i] instanceof Array && b[i] instanceof Array) {
		// recurse into the nested arrays
		if (!a[i].equals(b[i]))
                    return false;       
            }           
            else if (a[i] != b[i]) { 
		// Warning - two different object instances will never be equal: {x:20} != {x:20}
		return false;   
            }           
	}       
	return true;
    };
    result._arrayContainsArray = function( a, b ) {
	// if the other array is a falsy value, return
	if (!a || !b)
            return false;

	// compare lengths - can save a lot of time 
	if (a.length < b.length)
            return false;

	for (var i = 0, l=b.length; i < l; i++) {
            // Check if we have nested arrays
            if (a[i] instanceof Array && b[i] instanceof Array) {
		// recurse into the nested arrays
		if (!a[i].contains(b[i]))
                    return false;       
            }        
	    /*
            else if (a[i] != b[i]) { 
		// Warning - two different object instances will never be equal: {x:20} != {x:20}
		return false;   
		
            } 
	    */
            else if( a.indexOf(b[i]) == -1 ) {
		return false;
	    }
	}       
	return true;
    };
    //window.alert( "TEST: " + result );

    // This regex split omits empty lines
    //var lines = data.match(/[^\r\n]+/g); 
    var lines = data.split( "\n" );
    
    // The first line usually contains the name (if not beginning with '_')
    var i = 0;
    while( i < lines.length ) {
	lines[i] = lines[i].trim();

	if( lines[i] == "loop_" ) {
	    i = CIFFileReader._parseLoop( lines, i+1, result );

	} else if( lines[i] == ";" ) {
	    
	    // Skip complex data
	    i = CIFFileReader._readComplexData( lines, i, result );

	} else if( lines[i].startsWith("_") ) {

	    i = CIFFileReader._parseGlobal( lines, i, result );

	} else if( result.name == null ) { // i == 0 ) {

	    result.name = lines[i];
	    i++;

	} else {
	    // Unknown token. Skip line.
	    // (Let's hope it is not important)
	    i++;
	}
    } // END while
  
    //window.alert( "TEST: " + JSON.stringify(result) );
    return result;
};

/**
 * Line index i must be pointing on the first line after 'loop_'.
 **/
CIFFileReader._parseLoop = function( lines, i, result ) {

    var loopTable = { header : [],
		      data   : []
		    };

    i = CIFFileReader._parseLoopTableHeader( lines, i, loopTable );

    while( i < lines.length && (lines[i] = lines[i].trim()) != "" ) {

	if( (lines[i] = lines[i].trim()) == ";" ) {
	    i = CIFFileReader._readComplexData( lines, i, result );
	    continue;
	}

	var line = lines[i];
	// Parse table data (row)
	var row = line;
	loopTable.data.push( row );
	// SPLIT ROW!!!

	i++;
	    

    } // END while

    result.loopTables.push( loopTable );

    if( i < lines.length )
	return i+1;
    else
	return i;

};

/**
 * Line index i must point on the first 
 **/
CIFFileReader._parseLoopTableHeader = function( lines, i, loopTable ) {

    while( i < lines.length && (lines[i] = lines[i].trim()).startsWith("_") ) {

	loopTable.header.push( lines[i] );
	i++;

    }
    
    return i;
};

CIFFileReader._parseGlobal = function( lines, i, result ) {
    
    //window.alert( "parse global: " + lines[i] );

    var line  = lines[i].trim();
    var index = line.indexOf( " " );
    if( index == -1 ) {
	result.globals.push( line, null );
    } else {
	var name  = line.substring(0,index).trim();
	var value = line.substring(index+1).trim();
	//window.alert( name + "=" + value );
	result.globals[name] = value;
    }
    
    return i+1;

};

CIFFileReader._readComplexData = function( lines, i, result ) {

    while( i < lines.length && (lines[i] = lines[i].trim()) != ";" )
	i++;

    if( i+1 >= lines.length )
	return i;    // EOI reached
    else
	return i+1;  // Skip ';' line
};

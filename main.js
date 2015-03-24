/**
 * @date 2015-03-09
 **/


function loadCIFFile() {

    // [0] accesses the DOM element from the jQuery result
    var inputFiles = $( "#input_files" )[0];     

    CIFFileReader.readFile( inputFiles.files[0],
			    function( result ) { processCIF(result); }, 
			    function( errmsg ) { window.alert( errmsg ); }
			  );
}

function processCIF( cif ) {

    displayOutput( JSON.stringify(cif,null,"\t"), false );
    if( !$( "#process_data").is(":checked") ) 
	return;
	


    //window.alert( JSON.stringify( cif.globals ) );

    // Fetch some globals
    displayOutput( "_cell_length_a=" +    cif.globals["_cell_length_a"], false );
    displayOutput( "_cell_length_b=" +    cif.globals["_cell_length_b"], true );
    displayOutput( "_cell_length_c=" +    cif.globals["_cell_length_c"], true );
    displayOutput( "_cell_angle_alpha=" + cif.globals["_cell_angle_alpha"], true );
    displayOutput( "_cell_angle_beta=" +  cif.globals["_cell_angle_beta"], true );
    displayOutput( "_cell_angle_gamma=" + cif.globals["_cell_angle_gamma"], true );


    // Detect required tables
    var tableHeaderData = [
	"_atom_site_label",
	"_atom_site_type_symbol",
	"_atom_site_fract_x",
	"_atom_site_fract_y",
	"_atom_site_fract_z",
	"_atom_site_U_iso_or_equiv",
	"_atom_site_adp_type",
	"_atom_site_occupancy",
	"_atom_site_symmetry_multiplicity",
	"_atom_site_calc_flag",
	"_atom_site_refinement_flags",
	"_atom_site_disorder_assembly",
	"_atom_site_disorder_group"
    ];

    
    var tableHeaderBindings = [
	"_geom_bond_atom_site_label_1",
	"_geom_bond_atom_site_label_2",
	"_geom_bond_distance",
	"_geom_bond_site_symmetry_2",
	"_geom_bond_publ_flag"
    ];
	   
    //var tableGeneralData = cif.getLoopTable( tableHeaderGeneralData, true ); // partialMatch
    var tableData        = cif.getLoopTable( tableHeaderData,        true ); // partialMatch
    var tableBindings    = cif.getLoopTable( tableHeaderBindings,    true ); // partialMatch
    if( typeof tableData == "undefined" ) {
	displayOutput( "Looptable for data not found: " + JSON.stringify(tableHeaderData)+ "<br/>\n", true );
    } else if( typeof tableBindings == "undefined" ) {
	displayOutput( "Looptable for general data not found: " + JSON.strinigy(tableBindings)+ "<br/>\n", true );
    } else {

	//displayOutput( "Found " + tableGeneralData.data.length + " records of meta information.", true );
	displayOutput( "Found " + tableData.data.length + " atom(s).", true );
	displayOutput( "Found " + tableBindings.data.length + " binding(s).", true );

	
	displayOutput( "Looptable for general data not found: " + JSON.stringify(tableBindings,null,"\t")+ "<br/>\n", true );
    }
};




function displayOutput( data, append ) {
    if( append )
	document.getElementById( "output_div" ).innerHTML += data + "\n";
    else
	document.getElementById( "output_div" ).innerHTML = data + "\n";
}

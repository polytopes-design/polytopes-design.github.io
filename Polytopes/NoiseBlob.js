var NoiseBlob = function(_renderer, _analyzer, _light, _is_mobile)
{ 
    this.is_init = false;
    this.show_hdr = true;

    this.renderer = _renderer;
    this.audio_analyzer = _analyzer;
    this.light = _light;
    this.is_mobile = _is_mobile;

    this.w = _renderer.w;
    this.h = _renderer.h;

    this.init_texture();
    this.init_shader();
    this.Meshes = [];
    this.Vecs3D = [];
    this.init_scene();
    this.init_cubemap();
    this.group = null;
    this.textmesh = null;
};

NoiseBlob.prototype.update = function()
{ 
    var _shdrs = 
    [
        this.shdr_mesh, 
        this.shdr_wire, 
        this.shdr_poly, 
        this.shdr_poly2, 
        this.shdr_points, 
        this.shdr_pop_points, 
        this.shdr_pop_wire, 
        this.shdr_pop_points_out, 
        this.shdr_pop_wire_out, 
        this.shdr_shadow
    ];
    var _shdrs_size = _shdrs.length;

    for (var i = 0; i < _shdrs_size; i++)
    {
        _shdrs[i].uniforms.u_is_init.value  = this.is_init;
        _shdrs[i].uniforms.u_t.value        = this.timer;
        
        _shdrs[i].uniforms.u_audio_high.    value = this.audio_analyzer.get_high();
        _shdrs[i].uniforms.u_audio_mid.     value = this.audio_analyzer.get_mid();
        _shdrs[i].uniforms.u_audio_bass.    value = this.audio_analyzer.get_bass();
        _shdrs[i].uniforms.u_audio_level.   value = this.audio_analyzer.get_level();
        _shdrs[i].uniforms.u_audio_history. value = this.audio_analyzer.get_history();
    }

    // this.update_shadow_map();
    this.update_cubemap();

    var _cam = this.renderer.get_camera();
    this.renderer.renderer.render( this.scene, _cam);

    if (!this.is_init)
    { 
        this.is_init = true;

        console.log("NoiseBlob : is initiated");
    }

    this.timer = this.renderer.get_timer();
};

NoiseBlob.prototype.update_shadow_map = function()
{
    var _shadow_cam = this.light.get_light();
    var _shdow_fbo  = this.light.get_shadow_frame_buffer();

    this.renderer.renderer.render(this.shadow_scene, _shadow_cam, _shdow_fbo);

    var _light_pos = this.light.get_light_pos();
    _light_pos.applyMatrix4(this.renderer.matrix.modelViewMatrix);
    
    var _shadow_matrix = new THREE.Matrix4();
    _shadow_matrix.identity();
    _shadow_matrix.multiplyMatrices ( 
        this.light.get_light().projectionMatrix, 
        this.light.get_light().modelViewMatrix );

    this.shdr_mesh.uniforms.u_light_pos.    value = _light_pos;
    this.shdr_mesh.uniforms.u_shadow_matrix.value = _shadow_matrix;
    this.shdr_mesh.uniforms.u_shadow_map.   value = this.light.get_shadow_map();
};

NoiseBlob.prototype.init_shader = function()
{
    //var screen_res = 'vec2( ' + this.w.toFixed( 1 ) +', ' + this.h.toFixed( 1 ) + ')';
    var screen_res = 'vec2(200, 100)';
    
    function load(_vert, _frag){
        return new THREE.ShaderMaterial( 
        { 
            defines: 
            {
                SCREEN_RES: screen_res
            },
            uniforms: 
            {
                u_t:                {value: 0},
                u_is_init:          {value: false},
                u_audio_high:       {value: 0.},
                u_audio_mid:        {value: 0.},
                u_audio_bass:       {value: 0.},
                u_audio_level:      {value: 0.},
                u_audio_history:    {value: 0.}
            },
            vertexShader:   _vert,
            fragmentShader: _frag
        });
    };

    this.shdr_cubemap = new THREE.ShaderMaterial( 
        { 
            defines: 
            {
                SCREEN_RES: screen_res
            },
            uniforms: 
            {
                u_cubemap:      {value: this.cubemap},
                u_cubemap_b:    {value: this.cubemap_b},
                u_exposure:     {value: 2.},
                u_gamma:        {value: 2.2}
            },
            vertexShader:   skybox_vert,
            fragmentShader: skybox_frag
        });

    // scene shdr
    this.shdr_mesh              = load(blob_vert, blob_frag);
    this.shdr_wire              = load(blob_vert, blob_frag);
    this.shdr_poly              = load(blob_vert, blob_frag);
    this.shdr_poly2             = load(blob_vert, blob_frag);
    this.shdr_points            = load(blob_vert, blob_frag);
    this.shdr_shadow            = load(blob_vert, blob_frag);
    this.shdr_pop_points        = load(blob_vert, blob_frag);
    this.shdr_pop_wire          = load(blob_vert, blob_frag);
    this.shdr_pop_points_out    = load(blob_vert, blob_frag);
    this.shdr_pop_wire_out      = load(blob_vert, blob_frag);
    this.shdr_mesh.extensions.derivatives = true;

    this.shdr_poly.             defines.IS_MESH     = 'false'; 
    this.shdr_poly2.            defines.IS_MESH     = 'false';  
    this.shdr_mesh.             defines.IS_MESH     = 'false';      //just use one shader file but define in features for this mesh
    this.shdr_mesh.             defines.HAS_SHADOW  = 'true';

    this.shdr_wire.             defines.IS_WIRE     = 'false';
    this.shdr_poly.             defines.IS_WIRE     = 'false';
    this.shdr_poly.             defines.IS_POP      = 'false';
    this.shdr_poly2.            defines.IS_POP      = 'false';
    this.shdr_poly2.            defines.IS_WIRE     = 'false';
    this.shdr_poly2.            defines.IS_WHITE    = 'false';      //todo, aaron, currently adding
    
    this.shdr_points.           defines.IS_POINTS   = 'true';
    
    this.shdr_shadow.           defines.IS_SHADOW   = 'true';
    
    this.shdr_pop_points.       defines.IS_POINTS   = 'false';
    this.shdr_pop_points.       defines.IS_POP      = 'false';
    
    this.shdr_pop_wire.         defines.IS_WIRE     = 'false';
    this.shdr_pop_wire.         defines.IS_POP      = 'false';
    
    this.shdr_pop_points_out.   defines.IS_POINTS   = 'false';
    this.shdr_pop_points_out.   defines.IS_POP_OUT  = 'false';
    
    this.shdr_pop_wire_out.     defines.IS_WIRE     = 'false';
    this.shdr_pop_wire_out.     defines.IS_POP_OUT  = 'false';

    // this.shdr_poly.             defines.USE_MORPHTARGETS = 'true';  

    var _light_pos = this.light.get_light_pos();
    _light_pos.applyMatrix4(this.renderer.matrix.modelViewMatrix);
    
    var _shadow_matrix = new THREE.Matrix4();
    _shadow_matrix.identity();
    _shadow_matrix.multiplyMatrices ( 
        this.light.get_light().projectionMatrix, 
        this.light.get_light().modelViewMatrix );

    this.shdr_mesh.uniforms.u_light_pos         = {value: _light_pos};
    this.shdr_mesh.uniforms.u_shadow_matrix     = {value: _shadow_matrix};
    this.shdr_mesh.uniforms.u_shadow_map        = {value: this.light.get_shadow_map()};
    this.shdr_mesh.uniforms.u_debug_shadow      = {value: false};
    this.shdr_points.uniforms.          tex_sprite = {value: this.tex_sprite};
    this.shdr_pop_points.uniforms.      tex_sprite = {value: this.tex_sprite};
    this.shdr_pop_wire.uniforms.        tex_sprite = {value: this.tex_sprite};
    this.shdr_pop_points_out.uniforms.  tex_sprite = {value: this.tex_sprite};
    this.shdr_pop_wire_out.uniforms.    tex_sprite = {value: this.tex_sprite};
    
    var blendType = THREE.MultiplicativeBlending;
    this.shdr_points.           blending = blendType;
    this.shdr_poly.             blending = blendType;
    this.shdr_poly2.            blending = blendType;
    this.shdr_wire.             blending = blendType;
    this.shdr_pop_points.       blending = blendType;
    this.shdr_pop_wire.         blending = blendType;
    this.shdr_pop_points_out.   blending = blendType;
    this.shdr_pop_wire_out.     blending = blendType;
    
    this.shdr_poly.             transparent = true;
    this.shdr_poly2.            transparent = true;
    this.shdr_wire.             transparent = false;
    this.shdr_points.           transparent = true;
    this.shdr_pop_points.       transparent = true;
    this.shdr_pop_wire.         transparent = false;
    this.shdr_pop_points_out.   transparent = true;
    this.shdr_pop_wire_out.     transparent = false;

    this.shdr_wire.             depthTest = false;
    this.shdr_points.           depthTest = false;
    this.shdr_pop_points.       depthTest = false;
    this.shdr_pop_wire.         depthTest = false;
    this.shdr_pop_points_out.   depthTest = false;
    this.shdr_pop_wire_out.     depthTest = false;

    // this.shdr_poly.morphTargets = true;
    // this.shdr_poly2.morphTargets = true;
    this.shdr_poly.wireframe = false;
    this.shdr_poly2.wireframe = true;
    //console.log(this.shdr_poly);
};

//console.log(THREE.REVISION);
NoiseBlob.prototype.init_texture = function()
{
//    this.tex_sprite = new THREE.TextureLoader().load( "../common/assets/sprite_additive_rect.png" );
//    this.tex_sprite.wrapS = THREE.ClampToEdgeWrapping;
//    this.tex_sprite.wrapT = THREE.ClampToEdgeWrapping;
//    this.tex_sprite.magFilter = THREE.LinearFilter;
//    this.tex_sprite.minFilter = THREE.LinearFilter;
};
var loader;
var sce;
var shad;
NoiseBlob.prototype.init_scene = function()
{
    // var _sphere_size = 1.2;
    // var _geom           = new THREE.SphereBufferGeometry(_sphere_size, 10, 10);
    // var _geom_lowres    = new THREE.SphereBufferGeometry(_sphere_size, 100, 100);
    // var _geom_lowres    = new THREE.BoxBufferGeometry(_sphere_size, _sphere_size, _sphere_size, 50, 50, 50);


    // _geom_lowres.computeBoundingBox();

    this.scene          = new THREE.Scene();
    // this.shadow_scene   = new THREE.Scene();

    // var _mesh           = new THREE.Mesh    (_geom,         this.shdr_mesh);//create the meshes etc, and connect a shader, which does the coloing
    // var _wire           = new THREE.Line    (_geom_lowres,  this.shdr_wire);
    // var _points         = new THREE.Points  (_geom,         this.shdr_points);
    // var _shadow_mesh    = new THREE.Mesh    (_geom,         this.shdr_shadow);

    // var _pop_points     = new THREE.Points  (_geom_lowres, this.shdr_pop_points);
    // var _pop_wire       = new THREE.Line    (_geom_lowres, this.shdr_pop_wire);

    // var _pop_points_out = new THREE.Points  (_geom_lowres, this.shdr_pop_points_out);
    // var _pop_wire_out   = new THREE.Line    (_geom_lowres, this.shdr_pop_wire_out);
    
    // this.scene.add(_mesh);
    // this.scene.add(_wire);
    // this.scene.add(_points);

    // this.scene.add(_pop_points);
    // this.scene.add(_pop_wire);
    // this.scene.add(_pop_points_out);
    // this.scene.add(_pop_wire_out);

    // this.shadow_scene.add(_shadow_mesh);

    // var _geom_cube = new THREE.BoxBufferGeometry(100, 100, 100);
    // var _mesh_cube = new THREE.Mesh(_geom_cube, this.shdr_cubemap);

    // // var mS = (new THREE.Matrix4()).identity();
    // // mS.elements[0] = -1;
    // // mS.elements[5] = -1;
    // // mS.elements[10] = -1;

    // // _geom_cube.applyMatrix(mS);

    // this.scene.add(_mesh_cube);


sce     = this.scene;
shad    = this.shdr_poly;
shadwire= this.shdr_poly2;
mssh    = this.shdr_points;
self    = this;
    loader = new THREE.FontLoader();
    // loader.load('particleEqualizer_files/optimer_regular.typeface.json', function ( font )
    loader.load('Polytopes/TypoGraphica_Regular.json', function ( font ) 
    {
        var geometry = new THREE.TextBufferGeometry( "Polytopes.design", {
            font: font,
            size: 0.6,
            steps:2,
            height: 0.01,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.0,
            bevelSegments: 10
        } );
        geometry.center();
        self.textmesh           = new THREE.Mesh(geometry,  shad);//create the meshes etc, and connect a shader, which does the coloing
        // sce.add(self.textmesh);
        self.textmesh.position.set(0,0,-30);
    } );

    PolyPoints = [];


    var b = [];
    b[0] = new THREE.Vector4(1,0,0,0);
    b[1] = new THREE.Vector4(0,1,0,0);
    b[2] = new THREE.Vector4(0,0,1,0);
    b[3] = new THREE.Vector4(0,0,0,1);
    {
        var all2 = [];
        
        var I = []
        for (I[0] = -1; I[0] < 2; I[0]++)
        for (I[1] = -1; I[1] < 2; I[1]++)
        for (I[2] = -1; I[2] < 2; I[2]++)
        for (I[3] = -1; I[3] < 2; I[3]++)
        {
            var v = new THREE.Vector4(0,0,0,0);
            var c = 0;
            for (var k = 0; k < 4; k++)
            {
                var K = b[k].clone();
                K.multiplyScalar(I[k]);
                v.add(K);  
                if (I[k] != 0) c++;
            }
            if (c == 2)
            {
                all2.push(v);        
            }
        }

        var dim = 4;
        var scale = .6;
        Vecs3D = this.Vecs3D;
        var dimLerp = 2.1;
        for (var i = 0; i < all2.length; i++)
        {
            var v4 = all2[i];
            Vecs3D[i] = new THREE.Vector3(  dim*v4.x * scale/(v4.w + dim),
                                            dim*v4.y * scale/(v4.w + dim),
                                            dim*v4.z * scale/(v4.w + dim));
            // Vecs3D[i].Lerp2 = new THREE.Vector3(dimLerp*v4.x * scale/(v4.w + dimLerp),
            //                                     dimLerp*v4.y * scale/(v4.w + dimLerp),
            //                                     dimLerp*v4.z * scale/(v4.w + dimLerp));
        }

        var sets = [];
        var setI = [];
        var sen = [];
        var sen1 = [];
        var sen2 = [];
        var opposites = [];
        var oppI = [];
        var lengths = [];
        var sold = [];
        var solI = [];
        var Sols3D = [];
        var SolFac = [];

        var Far = new THREE.Vector4(0,0,0,6);
        
        for (var i = 0; i < all2.length; i++)
        {
            for (j = i+1; j< all2.length; j++)
            {
                var v = all2[i].clone().sub(all2[j]);
                if (v.length() < 1)
                {

                }
                else if (v.length() < 1.5)
                {
                    sets.push([all2[i], all2[j]])   
                    setI.push([i, j]); 
                }
                else if (v.length() < 2.1)
                {
                    var di = all2[i].clone().sub(Far).length();
                    var dj = all2[j].clone().sub(Far).length();

                    // if ((di > 3) || (dj > 3))   
                    // if (all2[i].x >=0)
                    // if (all2[i].w >=0)
                    {
                        opposites.push([all2[i], all2[j]]);
                        oppI.push([i, j]);
                        // Opps3D.push([Vecs3D[i], Vecs3D[j]]); 
                    }   
                           
                }
            }
        }
        // console.log(lengths);
        //console.log("ppp" + opposites.length)
        for (var i = 0; i < opposites.length; i++)
        for (var k = 0; k < 2; k++)
        {
            var K = 1;
            if (k==1) K = 0;

            var O1 = opposites[i][k];
            var O2 = opposites[i][K];

            for (var j = 0; j < sets.length; j++)
            for (var l = 0; l < 2; l++)
            {
                var L = 1;
                if (l==1) L = 0;

                var E1 = sets[j][l];
                var E2 = sets[j][L];
            
                if (O1 == E1)
                {
                    opposites[i].push(sets[j]);
                    oppI[i].push(setI[j])
                }    
            }
        }
        

        for (var i = 0; i < opposites.length; i++)
        {
            var O1 = opposites[i][0];
            var O2 = opposites[i][1];
            sold[i] = [];
            solI[i] = [];
            for (var j = 2; j < 18; j++)
            for (var l = 0; l < 2; l++)
            {
                // console.log("j"+j);
                var L = 1;
                if (l==1) L = 0;

                var Ea1 = opposites[i][j][l];
                var Ea2 = opposites[i][j][L];
            
                if (O1 == Ea1)
                {
                    //Ea2 is the loose end

                    for (var k = 2; k < 18; k++)
                    for (var m = 0; m < 2; m++)
                    {
                        var M = 1;
                        if (m==1) M = 0;

                        var Eb1 = opposites[i][k][m];
                        var Eb2 = opposites[i][k][M];
                    
                        if (O2 == Eb1)
                        {
                            //Eb2 is the loose end
                            if (Eb2 == Ea2)
                            {
                                opposites[i][j].push(2);
                                opposites[i][k].push(1);
                                solI[i].push(   oppI[i][j][l],
                                                oppI[i][j][L],
                                                oppI[i][k][M],
                                                oppI[i][k][m])
                                sold[i].push(Ea1, Ea2, Eb2, Eb1);
                                oppI[i].push([  oppI[i][j][l],
                                                oppI[i][j][L],
                                                oppI[i][k][M],
                                                oppI[i][k][m]])

                                opposites[i].push([O1, Ea2, Eb2, O2]);
                            }
                        }
                    }
                }   
            }
            SolFac[i] = [];
            for (var j = 18;    j < 22; j++)
            for (var k = j + 1; k < 22; k++)
            {
                var P1 = opposites[i][j][1];
                var P2 = opposites[i][k][1];

                var d = P1.clone().sub(P2).length();
                if (d < 1.5)
                {
                    opposites[i].push([P1, P2]);
                    oppI[i].push([oppI[i][j][1],oppI[i][k][1]]);
                    sold[i].push(P1, P2);
                    solI[i].push(oppI[i][j][1],oppI[i][k][1])
                    SolFac[i].push([oppI[i][j][0],oppI[i][j][1],oppI[i][k][1]]);
                    SolFac[i].push([oppI[i][k][3],oppI[i][j][1],oppI[i][k][1]]);
                }    

            }
        }
        //console.log(all2)
        //console.log(solI);
        //console.log("oppI");
        //console.log(oppI);
        
        //for each set of opposites, 
        //go through all the sets(lines) with to get the outside verticies
        //go through all of them to get ones that match inside vericies to determine the faces  

        group = new THREE.Group();
                //console.log(SolFac)
                // var lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff, wireframe: true, morphTargets: true  })
        for (var i = 0; i < solI.length; i++)
        {
            var Poly  = new THREE.Geometry();
            Sols3D[i] = Poly;
            
            var Offs = new THREE.Vector3(0,0,0);

            for (var j = 0; j < solI[i].length; j++)
            {
                // Offs.add(Vecs3D[solI[i][j]]);
                // Poly.vertices.push(Vecs3D[solI[i][j]]);
            }

            // var morphVerts = [];
            for (var j = 0; j < SolFac[i].length; j++)
            {
                // console.log(SolFac[i][j])
                var face = SolFac[i][j];
                // subdiv(Poly2.vertices,   Poly2.faces, Vecs3D[face[0]],        Vecs3D[face[1]],        Vecs3D[face[2]],        0);
                subdiv(Poly.vertices,   Poly.faces, Vecs3D[face[0]],        Vecs3D[face[1]],        Vecs3D[face[2]],        0);
                // subdiv(morphVerts,      null,       Vecs3D[face[0]].Lerp2,  Vecs3D[face[1]].Lerp2,  Vecs3D[face[2]].Lerp2,  3);
                Offs.add(Vecs3D[face[0]]);
                Offs.add(Vecs3D[face[1]]);
                Offs.add(Vecs3D[face[2]]);
                // Poly.vertices.push(vert);
            }
            // Poly.morphTargets[0] = {vertices: morphVerts};

            var polyLine = new THREE.Mesh(Poly, shad);
            var polyLinew = new THREE.Mesh(Poly, shadwire);
            // var polyLine2 = new THREE.Mesh(Poly2, shadwire);

            // polyLine.drawMode = THREE.TriangleStripDrawMode;

            group.add(polyLine);
            group.add(polyLinew);
            // sce.add(polyLine);
            // console.log(polyLine);
            // polyLine.updateMorphTargets();
            // polyLine.morphTargetInfluences = [];
             // polyLine.morphTargetInfluences[ 0 ] = 1;
            polyLine.doubleSided = true;
            var L = Math.abs(Offs.x) + Math.abs(Offs.y) + Math.abs(Offs.z);
            Offs.multiplyScalar(L * L /3000);
            // sce.add(polyLine2); polyLine2.position.lerp(Offs,1);          
            this.Meshes.push([polyLine, Offs]);
            this.Meshes.push([polyLinew, Offs]);

        }

        var S = 15;
        var D = 4;
        if (this.is_mobile == false)
        {
         
        var Poly2 = new THREE.Geometry();
        // subdiv(Poly2.vertices,   Poly2.faces, new THREE.Vector3(-S,0,-D), new THREE.Vector3(S,0,-D), new THREE.Vector3(0,S,-D), 4);
        // subdiv(Poly2.vertices,   Poly2.faces, new THREE.Vector3(-S,0,-D), new THREE.Vector3(S,0,-D), new THREE.Vector3(0,-S,-D), 4);

        var polyLine = new THREE.Mesh(Poly2, shadwire);
        sce.add(polyLine);

    // group.rotateOnWorldAxis(new THREE.Vector3(0,0,1), Math.PI/4);
    // group.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI/6);
    // group.rotateOnAxis(new THREE.Vector3(1,0,0), Math.PI/4);
   
        }
        sce.add(group);

//var ggeometry = new THREE.BoxGeometry(6, 4, 1);

//var geometryMorph = new THREE.BoxGeometry(3, 4, 1);
//var mmat =  new THREE.LineBasicMaterial( {color: 0xffffff, wireframe: true, morphTargets: true  } );

// // Set morphtargets for cube
//ggeometry.morphTargets[0] = {vertices: geometryMorph.vertices};
// ggeometry.computeMorphNormals();

//mmesh = new THREE.Mesh( ggeometry, shad );            mmesh.morphTargetInfluences[ 0 ] = 1;
//console.log(mmesh);
// sce.add(mmesh);
    }

  //  console.log(this.Meshes);

    function subdiv(vertices, faces, a,b,c, depth)
    {
        if (depth == 0)
        {
            var index = vertices.length;
            vertices.push(a);
            vertices.push(b);
            vertices.push(c);      
            if (faces)
            {
                faces.push(new THREE.Face3(index, index + 1, index + 2));
            }
            return;
        }
        var ab = a.clone();
        var bc = b.clone();
        var ca = c.clone();

        ab.lerp(b,0.5);
        bc.lerp(c,0.5);
        ca.lerp(a,0.5);

        subdiv(vertices, faces, a,  ab, ca, depth-1);
        subdiv(vertices, faces, b,  bc, ab, depth-1);
        subdiv(vertices, faces, c,  ca, bc, depth-1);
        subdiv(vertices, faces, ab, bc, ca, depth-1);
    }
};

NoiseBlob.prototype.set_retina = function()
{
    this.w *= .5;
    this.h *= .5;
};

NoiseBlob.prototype.init_cubemap = function()
{
    var _path = "../common/assets/";
    var _format = '.jpg';
    var _urls = [
        _path + 'px_3js' + _format, _path + 'nx_3js' + _format,
        _path + 'py_3js' + _format, _path + 'ny_3js' + _format,
        _path + 'pz_3js' + _format, _path + 'nz_3js' + _format
    ];
    
    this.cubemap = new THREE.CubeTextureLoader().load( _urls );
    this.cubemap.format = THREE.RGBFormat;

    _urls = [
        _path + 'px' + _format, _path + 'nx' + _format,
        _path + 'py' + _format, _path + 'ny' + _format,
        _path + 'pz' + _format, _path + 'nz' + _format
    ];

    this.cubemap_b = new THREE.CubeTextureLoader().load( _urls );
    this.cubemap_b.format = THREE.RGBFormat;

    this.shdr_mesh.     uniforms.cubemap            = {value: this.cubemap};
    this.shdr_cubemap.  uniforms.u_cubemap.value    = this.cubemap;
    this.shdr_mesh.     uniforms.cubemap_b          = {value: this.cubemap_b};
    this.shdr_cubemap.  uniforms.u_cubemap_b.value  = this.cubemap_b;
    this.shdr_cubemap.  uniforms.u_show_cubemap     = {value:this.show_hdr};
    this.shdr_mesh.defines.HAS_CUBEMAP = 'true';
};

NoiseBlob.prototype.toggle_cubemap = function()
{
    this.shdr_cubemap.uniforms.u_show_cubemap.value = this.show_hdr;
};


NoiseBlob.prototype.update_cubemap = function()
{
    // var _cross_fader = (Math.sin(this.audio_analyzer.get_history()) + 1.) / 2.;
    var _cross_fader = 0.;
    // var _cross_fader = 1.-this.audio_analyzer.get_level();
    this.shdr_mesh.     uniforms.cross_fader = {value:_cross_fader};
    this.shdr_cubemap.  uniforms.cross_fader = {value:_cross_fader};

    this.shdr_cubemap.  uniforms.u_exposure.  value = this.pbr.get_exposure();
    this.shdr_cubemap.  uniforms.u_gamma.     value = this.pbr.get_gamma();
};

NoiseBlob.prototype.set_PBR = function(_pbr)
{
    this.pbr = _pbr;

    this.shdr_mesh.uniforms.tex_normal      = {value: this.pbr.get_normal_map()};
    this.shdr_mesh.uniforms.tex_roughness   = {value: this.pbr.get_roughness_map()};
    this.shdr_mesh.uniforms.tex_metallic    = {value: this.pbr.get_metallic_map()};
    
    this.shdr_mesh.uniforms.u_normal        = {value: this.pbr.get_normal()};
    this.shdr_mesh.uniforms.u_roughness     = {value: this.pbr.get_roughness()};
    this.shdr_mesh.uniforms.u_metallic      = {value: this.pbr.get_metallic()};
    
    this.shdr_mesh.uniforms.u_exposure      = {value: this.pbr.get_exposure()};
    this.shdr_mesh.uniforms.u_gamma         = {value: this.pbr.get_gamma()};

    this.shdr_mesh.uniforms.u_view_matrix_inverse = {value: this.renderer.get_inversed_matrix()};

    this.shdr_mesh.defines.IS_PBR = 'true';
};

NoiseBlob.prototype.update_PBR = function()
{
    // this.shdr_mesh.uniforms.u_normal.   value = this.pbr.get_normal();
    // this.shdr_mesh.uniforms.u_roughness.value = this.pbr.get_roughness();
    // this.shdr_mesh.uniforms.u_metallic. value = this.pbr.get_metallic();
    
    // this.shdr_mesh.uniforms.u_exposure. value = this.pbr.get_exposure();
    // this.shdr_mesh.uniforms.u_gamma.    value = this.pbr.get_gamma();

    // this.shdr_mesh.uniforms.u_view_matrix_inverse.value = this.renderer.get_inversed_matrix();
};

NoiseBlob.prototype.update_positions = function()
{
    if (this.rate != null) this.rate += (0.0125-this.rate)*0.105;
    else this.rate = 1;
    if (this.inf != null) this.inf += 0.1231;
    else this.inf = 0;
    for (var i = 0; i < this.Meshes.length; i++) 
    {
        var polyLine = this.Meshes[i][0];
        var Offs = this.Meshes[i][1];
        polyLine.position.lerp(Offs, 0.05);
        // polyLine.morphTargetInfluences[ 0 ] = 0;//1;//Math.sin(this.inf)/2 + 0.5;
    // console.log(polyLine.morphTargetInfluences[0]);
    }
    group.rotateOnAxis(new THREE.Vector3(0,1,0), this.rate);
    
        // console.log(this.textmesh);
    if (this.textmesh != null)
    {
        this.textmesh.position.lerp(new THREE.Vector3(0,0.52,-2), 0.15);        
    }

};

//NoiseBlob.prototype.debug_shadow_map = function(_show)
{
    this.shdr_mesh.uniforms.u_debug_shadow.value = _show;
};
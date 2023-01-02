
const colorVertShader= `
			attribute vec4 a_position;

			uniform mat4 u_projection;
			uniform mat4 u_view;
			uniform mat4 u_world;

			void main() {
			  // Multiply the position by the matrices.
			  gl_Position = u_projection * u_view * u_world * a_position;
			}`;
const colorFragShader= `
			precision mediump float;

			uniform vec4 u_color;
			void main() {
			  gl_FragColor = u_color;
			}`;



const vertShader =  `
attribute vec4 a_position;
attribute vec3 a_normal;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

varying vec3 v_normal;

void main() {
  gl_Position = u_projection * u_view * u_world * a_position;
  v_normal = mat3(u_world) * a_normal;
}
`;

const fragShader = `
  precision mediump float;

  varying vec3 v_normal;

  uniform vec4 u_diffuse;
  uniform vec3 u_lightDirection;

  void main () {
    vec3 normal = normalize(v_normal);
    float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
    gl_FragColor = vec4(u_diffuse.rgb * fakeLight, u_diffuse.a);
  }
  `;


//SKYBOX SHADERS 
const skyVertShader = `
    attribute vec4 a_position;
    
    varying vec4 v_position;
    
    void main() {
        v_position = a_position;  
        gl_Position = a_position;
        gl_Position.z = 1.0;
    }
   `;

const skyFragShader = `
    precision mediump float;
    
    uniform samplerCube u_skybox;
    uniform mat4 u_viewDirectionProjectionInverse; //?
    
    varying vec4 v_position;
    
    void main() {
        vec4 t = u_viewDirectionProjectionInverse * v_position;
        gl_FragColor = textureCube(u_skybox, normalize(t.xyz/t.w));
    }
    `;

  const sunVertShader = `
		attribute vec4 a_position;
		attribute vec2 a_texcoord;
		attribute vec3 a_normal;

		uniform mat4 u_projection;
		uniform mat4 u_view;
		uniform mat4 u_world;
		uniform mat4 u_textureMatrix;

		varying vec2 v_texcoord;
		varying vec4 v_projectedTexcoord;
		varying vec3 v_normal;
		
		void main() {
		  // Multiply the position by the matrix.
		  vec4 worldPosition = u_world * a_position;

		  gl_Position = u_projection * u_view * worldPosition;

		  // Pass the texture coord to the fragment shader.
		  v_texcoord = a_texcoord;

		  v_projectedTexcoord = u_textureMatrix * worldPosition;

		  // orient the normals and pass to the fragment shader
		  v_normal = mat3(u_world) * a_normal;}`;
		
		const sunFragShader = `
		precision mediump float;

		// Passed in from the vertex shader.
		varying vec2 v_texcoord;
		varying vec4 v_projectedTexcoord;
		varying vec3 v_normal;

		uniform vec4 u_colorMult;
		uniform sampler2D u_texture;
		uniform sampler2D u_projectedTexture;
		uniform float u_bias;
		uniform float u_lightIntensity;
		uniform float u_shadowIntensity;
		uniform vec3 u_reverseLightDirection;

		void main() {
		  // because v_normal is a varying it's interpolated
		  // so it will not be a unit vector. Normalizing it
		  // will make it a unit vector again
		  vec3 normal = normalize(v_normal);

		  float light = dot(normal, u_reverseLightDirection);

		  vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;
		  float currentDepth = projectedTexcoord.z + u_bias;

		  bool inRange =
			  projectedTexcoord.x >= 0.0 &&
			  projectedTexcoord.x <= 1.0 &&
			  projectedTexcoord.y >= 0.0 &&
			  projectedTexcoord.y <= 1.0;

		  // the 'r' channel has the depth values
		  float projectedDepth = texture2D(u_projectedTexture, projectedTexcoord.xy).r;
		  float shadowLight = (inRange && projectedDepth <= currentDepth) ? u_shadowIntensity : u_lightIntensity; //2.5;

		  vec4 texColor = texture2D(u_texture, v_texcoord) * u_colorMult;
		  gl_FragColor = vec4(texColor.rgb * light * shadowLight,	 texColor.a);

			}`;

export {colorVertShader, colorFragShader, vertShader, fragShader, skyVertShader, skyFragShader, sunVertShader, sunFragShader};
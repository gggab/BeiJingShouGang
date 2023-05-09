module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1683552020091, function(require, module, exports) {
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
(function(global2, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("abab"), require("jssha")) : typeof define === "function" && define.amd ? define(["exports", "abab", "jssha"], factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, factory(global2.CLSClient = {}, global2.abab, global2.jssha));
})(this, function(exports2, abab, jsSHA) {
  
  const _interopDefaultLegacy = (e) => e && typeof e === "object" && "default" in e ? e : { default: e };
  const jsSHA__default = /* @__PURE__ */ _interopDefaultLegacy(jsSHA);
  class Vec3 {
    constructor(x, y, z) {
      this.x = x ? x : 0;
      this.y = y ? y : 0;
      this.z = z ? z : 0;
    }
    set(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    clone() {
      let v = new Vec3(this.x, this.y, this.z);
      return v;
    }
    scale(n) {
      this.x *= n;
      this.y *= n;
      this.z *= n;
      return this;
    }
    getLength() {
      let lengthSq = this.x * this.x + this.y * this.y + this.z * this.z;
      return Math.sqrt(lengthSq);
    }
    getLengthSq() {
      let lengthSq = this.x * this.x + this.y * this.y + this.z * this.z;
      return lengthSq;
    }
    normalize() {
      let lengthSq = this.x * this.x + this.y * this.y + this.z * this.z;
      if (lengthSq > 0) {
        var invLength = 1 / Math.sqrt(lengthSq);
        this.x *= invLength;
        this.y *= invLength;
        this.z *= invLength;
      }
      return this;
    }
    add(v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      return this;
    }
    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
      return this;
    }
    distance(v) {
      let diff = this.clone().sub(v);
      let d = diff.getLength();
      return d;
    }
    dot(v) {
      let val = this.x * v.x + this.y * v.y + this.z * v.z;
      return val;
    }
    getAngle(v) {
      let dotVal = this.dot(v);
      let t = dotVal / (this.getLength() * v.getLength());
      let angle = Math.acos(t) * 180 / Math.PI;
      return angle;
    }
  }
  class Quat {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 0;
    }
    setFromMat4(m) {
      let quat = this;
      let m00, m01, m02, m10, m11, m12, m20, m21, m22, tr, s, rs, lx, ly, lz;
      m00 = m.data[0];
      m01 = m.data[4];
      m02 = m.data[8];
      m10 = m.data[1];
      m11 = m.data[5];
      m12 = m.data[9];
      m20 = m.data[2];
      m21 = m.data[6];
      m22 = m.data[10];
      lx = m00 * m00 + m01 * m01 + m02 * m02;
      if (lx === 0)
        return quat;
      lx = 1 / Math.sqrt(lx);
      ly = m10 * m10 + m11 * m11 + m12 * m12;
      if (ly === 0)
        return quat;
      ly = 1 / Math.sqrt(ly);
      lz = m20 * m20 + m21 * m21 + m22 * m22;
      if (lz === 0)
        return quat;
      lz = 1 / Math.sqrt(lz);
      m00 *= lx;
      m01 *= lx;
      m02 *= lx;
      m10 *= ly;
      m11 *= ly;
      m12 *= ly;
      m20 *= lz;
      m21 *= lz;
      m22 *= lz;
      tr = m00 + m11 + m22;
      if (tr >= 0) {
        s = Math.sqrt(tr + 1);
        quat.w = s * 0.5;
        s = 0.5 / s;
        quat.x = (m12 - m21) * s;
        quat.y = (m20 - m02) * s;
        quat.z = (m01 - m10) * s;
      } else {
        if (m00 > m11) {
          if (m00 > m22) {
            rs = m00 - (m11 + m22) + 1;
            rs = Math.sqrt(rs);
            quat.x = rs * 0.5;
            rs = 0.5 / rs;
            quat.w = (m12 - m21) * rs;
            quat.y = (m01 + m10) * rs;
            quat.z = (m02 + m20) * rs;
          } else {
            rs = m22 - (m00 + m11) + 1;
            rs = Math.sqrt(rs);
            quat.z = rs * 0.5;
            rs = 0.5 / rs;
            quat.w = (m01 - m10) * rs;
            quat.x = (m20 + m02) * rs;
            quat.y = (m21 + m12) * rs;
          }
        } else if (m11 > m22) {
          rs = m11 - (m22 + m00) + 1;
          rs = Math.sqrt(rs);
          quat.y = rs * 0.5;
          rs = 0.5 / rs;
          quat.w = (m20 - m02) * rs;
          quat.z = (m12 + m21) * rs;
          quat.x = (m10 + m01) * rs;
        } else {
          rs = m22 - (m00 + m11) + 1;
          rs = Math.sqrt(rs);
          quat.z = rs * 0.5;
          rs = 0.5 / rs;
          quat.w = (m01 - m10) * rs;
          quat.x = (m20 + m02) * rs;
          quat.y = (m21 + m12) * rs;
        }
      }
      return quat;
    }
    slerp(lhs, rhs, alpha) {
      const lx = lhs.x;
      const ly = lhs.y;
      const lz = lhs.z;
      const lw = lhs.w;
      let rx = rhs.x;
      let ry = rhs.y;
      let rz = rhs.z;
      let rw = rhs.w;
      let cosHalfTheta = lw * rw + lx * rx + ly * ry + lz * rz;
      if (cosHalfTheta < 0) {
        rw = -rw;
        rx = -rx;
        ry = -ry;
        rz = -rz;
        cosHalfTheta = -cosHalfTheta;
      }
      if (Math.abs(cosHalfTheta) >= 1) {
        this.w = lw;
        this.x = lx;
        this.y = ly;
        this.z = lz;
        return this;
      }
      const halfTheta = Math.acos(cosHalfTheta);
      const sinHalfTheta = Math.sqrt(1 - cosHalfTheta * cosHalfTheta);
      if (Math.abs(sinHalfTheta) < 1e-3) {
        this.w = lw * 0.5 + rw * 0.5;
        this.x = lx * 0.5 + rx * 0.5;
        this.y = ly * 0.5 + ry * 0.5;
        this.z = lz * 0.5 + rz * 0.5;
        return this;
      }
      const ratioA = Math.sin((1 - alpha) * halfTheta) / sinHalfTheta;
      const ratioB = Math.sin(alpha * halfTheta) / sinHalfTheta;
      this.w = lw * ratioA + rw * ratioB;
      this.x = lx * ratioA + rx * ratioB;
      this.y = ly * ratioA + ry * ratioB;
      this.z = lz * ratioA + rz * ratioB;
      return this;
    }
  }
  class Mat4 {
    constructor() {
      __publicField(this, "data");
      let data = new Float32Array(16);
      data[0] = data[5] = data[10] = data[15] = 1;
      this.data = data;
    }
    static fromArray(data) {
      return new Mat4().set(data);
    }
    set(m) {
      for (let i = 0; i < m.length; i++) {
        this.data[i] = m[i];
      }
      return this;
    }
    clone() {
      let m = new Mat4();
      m.set(this.data);
      return m;
    }
    transpose() {
      let te = this.data;
      let tmp;
      tmp = te[1];
      te[1] = te[4];
      te[4] = tmp;
      tmp = te[2];
      te[2] = te[8];
      te[8] = tmp;
      tmp = te[6];
      te[6] = te[9];
      te[9] = tmp;
      tmp = te[3];
      te[3] = te[12];
      te[12] = tmp;
      tmp = te[7];
      te[7] = te[13];
      te[13] = tmp;
      tmp = te[11];
      te[11] = te[14];
      te[14] = tmp;
      return this;
    }
    getInverse() {
      let me = this.data;
      let te = [], n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3], n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7], n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11], n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15], t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44, t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44, t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44, t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
      let det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
      if (det === 0) {
        throw new Error("error!");
      }
      let detInv = 1 / det;
      te[0] = t11 * detInv;
      te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
      te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
      te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;
      te[4] = t12 * detInv;
      te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
      te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
      te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;
      te[8] = t13 * detInv;
      te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
      te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
      te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;
      te[12] = t14 * detInv;
      te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
      te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
      te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
      this.data = new Float32Array(te);
      return this;
    }
    determinant() {
      const te = this.data;
      const n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
      const n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
      const n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
      const n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];
      return n41 * (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) + n42 * (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) + n43 * (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) + n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31);
    }
    decompose() {
      const te = this.data;
      let sx = new Vec3(te[0], te[1], te[2]).getLength();
      let sy = new Vec3(te[4], te[5], te[6]).getLength();
      let sz = new Vec3(te[8], te[9], te[10]).getLength();
      const det = this.determinant();
      if (det < 0)
        sx = -sx;
      let position = new Vec3(te[12], te[13], te[14]);
      let rotation = new Mat4();
      rotation.set(this.data);
      const invSX = 1 / sx;
      const invSY = 1 / sy;
      const invSZ = 1 / sz;
      rotation.data[0] *= invSX;
      rotation.data[1] *= invSX;
      rotation.data[2] *= invSX;
      rotation.data[4] *= invSY;
      rotation.data[5] *= invSY;
      rotation.data[6] *= invSY;
      rotation.data[8] *= invSZ;
      rotation.data[9] *= invSZ;
      rotation.data[10] *= invSZ;
      let scale = new Vec3(sx, sy, sz);
      scale.x = sx;
      scale.y = sy;
      scale.z = sz;
      return { position, rotation, scale };
    }
    mul2(lhs, rhs) {
      const a = lhs.data;
      const b = rhs.data;
      const r = this.data;
      const a00 = a[0];
      const a01 = a[1];
      const a02 = a[2];
      const a03 = a[3];
      const a10 = a[4];
      const a11 = a[5];
      const a12 = a[6];
      const a13 = a[7];
      const a20 = a[8];
      const a21 = a[9];
      const a22 = a[10];
      const a23 = a[11];
      const a30 = a[12];
      const a31 = a[13];
      const a32 = a[14];
      const a33 = a[15];
      let b0, b1, b2, b3;
      b0 = b[0];
      b1 = b[1];
      b2 = b[2];
      b3 = b[3];
      r[0] = a00 * b0 + a10 * b1 + a20 * b2 + a30 * b3;
      r[1] = a01 * b0 + a11 * b1 + a21 * b2 + a31 * b3;
      r[2] = a02 * b0 + a12 * b1 + a22 * b2 + a32 * b3;
      r[3] = a03 * b0 + a13 * b1 + a23 * b2 + a33 * b3;
      b0 = b[4];
      b1 = b[5];
      b2 = b[6];
      b3 = b[7];
      r[4] = a00 * b0 + a10 * b1 + a20 * b2 + a30 * b3;
      r[5] = a01 * b0 + a11 * b1 + a21 * b2 + a31 * b3;
      r[6] = a02 * b0 + a12 * b1 + a22 * b2 + a32 * b3;
      r[7] = a03 * b0 + a13 * b1 + a23 * b2 + a33 * b3;
      b0 = b[8];
      b1 = b[9];
      b2 = b[10];
      b3 = b[11];
      r[8] = a00 * b0 + a10 * b1 + a20 * b2 + a30 * b3;
      r[9] = a01 * b0 + a11 * b1 + a21 * b2 + a31 * b3;
      r[10] = a02 * b0 + a12 * b1 + a22 * b2 + a32 * b3;
      r[11] = a03 * b0 + a13 * b1 + a23 * b2 + a33 * b3;
      b0 = b[12];
      b1 = b[13];
      b2 = b[14];
      b3 = b[15];
      r[12] = a00 * b0 + a10 * b1 + a20 * b2 + a30 * b3;
      r[13] = a01 * b0 + a11 * b1 + a21 * b2 + a31 * b3;
      r[14] = a02 * b0 + a12 * b1 + a22 * b2 + a32 * b3;
      r[15] = a03 * b0 + a13 * b1 + a23 * b2 + a33 * b3;
      return this;
    }
    mul(rhs) {
      return this.mul2(this, rhs);
    }
    compose(position, quaternion, scale) {
      const te = this.data;
      const x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
      const x2 = x + x, y2 = y + y, z2 = z + z;
      const xx = x * x2, xy = x * y2, xz = x * z2;
      const yy = y * y2, yz = y * z2, zz = z * z2;
      const wx2 = w * x2, wy = w * y2, wz = w * z2;
      const sx = scale.x, sy = scale.y, sz = scale.z;
      te[0] = (1 - (yy + zz)) * sx;
      te[1] = (xy + wz) * sx;
      te[2] = (xz - wy) * sx;
      te[3] = 0;
      te[4] = (xy - wz) * sy;
      te[5] = (1 - (xx + zz)) * sy;
      te[6] = (yz + wx2) * sy;
      te[7] = 0;
      te[8] = (xz + wy) * sz;
      te[9] = (yz - wx2) * sz;
      te[10] = (1 - (xx + yy)) * sz;
      te[11] = 0;
      te[12] = position.x;
      te[13] = position.y;
      te[14] = position.z;
      te[15] = 1;
      return this;
    }
    setTRS(t, r, s) {
      var tx, ty, tz, qx, qy, qz, qw, sx, sy, sz, x2, y2, z2, xx, xy, xz, yy, yz, zz, wx2, wy, wz, m;
      tx = t.x;
      ty = t.y;
      tz = t.z;
      qx = r.x;
      qy = r.y;
      qz = r.z;
      qw = r.w;
      sx = s.x;
      sy = s.y;
      sz = s.z;
      x2 = qx + qx;
      y2 = qy + qy;
      z2 = qz + qz;
      xx = qx * x2;
      xy = qx * y2;
      xz = qx * z2;
      yy = qy * y2;
      yz = qy * z2;
      zz = qz * z2;
      wx2 = qw * x2;
      wy = qw * y2;
      wz = qw * z2;
      m = this.data;
      m[0] = (1 - (yy + zz)) * sx;
      m[1] = (xy + wz) * sx;
      m[2] = (xz - wy) * sx;
      m[3] = 0;
      m[4] = (xy - wz) * sy;
      m[5] = (1 - (xx + zz)) * sy;
      m[6] = (yz + wx2) * sy;
      m[7] = 0;
      m[8] = (xz + wy) * sz;
      m[9] = (yz - wx2) * sz;
      m[10] = (1 - (xx + yy)) * sz;
      m[11] = 0;
      m[12] = tx;
      m[13] = ty;
      m[14] = tz;
      m[15] = 1;
      return this;
    }
    multiplyMatrices(a, b) {
      const ae = a.data;
      const be = b.data;
      const te = this.data;
      const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
      const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
      const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
      const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];
      const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
      const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
      const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
      const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];
      te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
      te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
      te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
      te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
      te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
      te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
      te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
      te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
      te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
      te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
      te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
      te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
      te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
      te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
      te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
      te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
      return this;
    }
    makePerspective(left, right, top, bottom, near, far) {
      if (far === void 0) {
        console.warn("THREE.Matrix4: .makePerspective() has been redefined and has a new signature. Please check the docs.");
      }
      const te = this.data;
      const x = 2 * near / (right - left);
      const y = 2 * near / (top - bottom);
      const a = (right + left) / (right - left);
      const b = (top + bottom) / (top - bottom);
      const c = -(far + near) / (far - near);
      const d = -2 * far * near / (far - near);
      te[0] = x;
      te[4] = 0;
      te[8] = a;
      te[12] = 0;
      te[1] = 0;
      te[5] = y;
      te[9] = b;
      te[13] = 0;
      te[2] = 0;
      te[6] = 0;
      te[10] = c;
      te[14] = d;
      te[3] = 0;
      te[7] = 0;
      te[11] = -1;
      te[15] = 0;
      return this;
    }
    makeOrthographic(left, right, top, bottom, near, far) {
      const te = this.data;
      const w = 1 / (right - left);
      const h = 1 / (top - bottom);
      const p = 1 / (far - near);
      const x = (right + left) * w;
      const y = (top + bottom) * h;
      const z = (far + near) * p;
      te[0] = 2 * w;
      te[4] = 0;
      te[8] = 0;
      te[12] = -x;
      te[1] = 0;
      te[5] = 2 * h;
      te[9] = 0;
      te[13] = -y;
      te[2] = 0;
      te[6] = 0;
      te[10] = -2 * p;
      te[14] = -z;
      te[3] = 0;
      te[7] = 0;
      te[11] = 0;
      te[15] = 1;
      return this;
    }
    toJSON() {
      return Array.from(this.data);
    }
  }
  function compareVersion(v1, v2) {
    v1 = v1.split(".");
    v2 = v2.split(".");
    const len = Math.max(v1.length, v2.length);
    while (v1.length < len) {
      v1.push("0");
    }
    while (v2.length < len) {
      v2.push("0");
    }
    for (let i = 0; i < len; i++) {
      const num1 = parseInt(v1[i]);
      const num2 = parseInt(v2[i]);
      if (num1 > num2) {
        return 1;
      } else if (num1 < num2) {
        return -1;
      }
    }
    return 0;
  }
  function isLastV43(v) {
    return compareVersion(v, "4.3") >= 0;
  }
  function assert(v, msg) {
    if (!v)
      throw new Error(msg);
  }
  function processPoseSchema(pose) {
    let mat = new Mat4();
    mat.set(pose);
    let cameraMat = mat.clone().transpose();
    let { position, rotation, scale } = cameraMat.decompose();
    let nor = new Vec3(cameraMat.data[8], cameraMat.data[9], cameraMat.data[10]);
    let forward = nor.normalize().scale(-1);
    return { position, forward, rotation, scale };
  }
  function processPoseCamera(pose) {
    let mat = new Mat4();
    mat.set(pose);
    let cameraMat = mat.clone().transpose().getInverse();
    let { position, rotation, scale } = cameraMat.decompose();
    let nor = new Vec3(cameraMat.data[8], cameraMat.data[9], cameraMat.data[10]);
    let forward = nor.normalize().scale(-1);
    return { position, forward, rotation, scale };
  }
  const globalUrl = "https://global.easyar.cn";
  const arocUrl = "https://aroc-api.easyar.com";
  const clsUrl = "https://cls-api.easyar.com";
  const clsV3Url = "https://clsv3-api.easyar.com";
  const uacUrl = "https://uac.easyar.com";
  const config = {
    globalUrl,
    arocUrl,
    clsUrl,
    uacUrl,
    clsV3Url,
    emaUrl: "https://large-spatialmaps.easyar.com"
  };
  function getClsHost(clsVersion, originalHost) {
    if (originalHost && [config.clsV3Url, config.clsUrl].indexOf(originalHost) < 0)
      return originalHost;
    return isLastV43(clsVersion) ? config.clsV3Url : config.clsUrl;
  }
  function getClsUrl(clsVersion) {
    let version = "";
    if (clsVersion.indexOf(".") >= 0)
      version = clsVersion.split(".")[0];
    if (clsVersion === "2")
      clsVersion = "3";
    let gpu = clsVersion === "3";
    let gpuPath = gpu ? "/gpu" : "";
    return `${getClsHost(clsVersion, config.clsUrl)}/v${version}${gpuPath}/file/localize`;
  }
  const request = request_mini;
  async function request_mini(url, method, params, headers, data) {
    let keys = Object.keys(params || {});
    let paramString = keys.length ? keys.map((key) => `${key}=${encodeURIComponent(params[key])}`).join("&") : void 0;
    let urlFinal = url + (paramString ? `?${paramString}` : "");
    return new Promise((resolve, reject) => {
      let option = {
        url: urlFinal,
        method,
        success: (res) => {
          resolve(res.data);
        },
        fail: (e) => {
          reject(e);
        }
      };
      if (headers)
        option.header = headers;
      if (data)
        option.data = data;
      wx.request(option);
    });
  }
  function getClsInfoAnonymous(id) {
    return request(`${config.globalUrl}/anonymous/cls/${id}`, "GET", {}, null, null);
  }
  function getArannotations(host, appId, authorization) {
    return request(`${host}/cls/arannotations`, "GET", { appId, pageNum: 1, pageSize: 100 }, { authorization }, null);
  }
  function getArannotation(host, araId, appId, authorization) {
    return request(`${host}/cls/arannotation/${araId}`, "GET", { appId }, { authorization }, null);
  }
  function getPoseFusion(pose, resolve) {
    let params = JSON.stringify(pose);
    return request("https://posefusion.easyar.com/pose/v1", "POST", null, null, params).then((res) => {
      return resolve(res);
    });
  }
  function sha256(msg) {
    let shaObj = new jsSHA__default.default("SHA-256", "TEXT");
    shaObj.update(msg);
    return shaObj.getHash("HEX");
  }
  let tokens = {};
  let tokenExpireTimes = {};
  function getToken(apiKey, apiSecret) {
    let timestamp = new Date().getTime();
    if (tokenExpireTimes[apiKey] && timestamp < tokenExpireTimes[apiKey] && tokens[apiKey]) {
      return Promise.resolve(tokens[apiKey]);
    }
    const expires = 3600;
    tokenExpireTimes[apiKey] = timestamp + expires * 1e3;
    let params = { expires, timestamp, apiKey };
    let signStr = Object.keys(params).sort().map((key) => `${key}${params[key]}`).concat(apiSecret).join("");
    params.signature = sha256(signStr);
    return request(`${config.uacUrl}/token/v2`, "POST", null, null, params).then((res) => {
      if (res.result && res.result.token) {
        tokens[apiKey] = res.result.token;
        return tokens[apiKey];
      }
      console.log("token error");
      return "TOKEN_ERROR";
    });
  }
  function cubeListsFromEma(ema, meta) {
    var _a, _b, _c;
    let clusters = {};
    let blocks = {};
    let maps = {};
    let relationships = [];
    if (ema.clusters)
      for (let cluster of ema.clusters) {
        clusters[cluster.id] = [];
      }
    if (ema.blocks)
      for (let block of ema.blocks) {
        blocks[block.id] = [];
      }
    if (ema.extensions) {
      let aliasExtension = ema.extensions.find(
        (e) => e.vender === "EasyAR" && e.name === "BlockAlias"
      );
      if (aliasExtension) {
        if (aliasExtension.details.blocks) {
          for (let blockAlias of aliasExtension.details.blocks) {
            let src = blockAlias.id;
            for (let dest of blockAlias.aliases) {
              blocks[dest] = blocks[src];
            }
          }
        }
      }
    }
    if (ema.annotations)
      for (let annotation of ema.annotations) {
        if (annotation.parent) {
          let parentArray = null;
          switch (annotation.parent.type) {
            case "cluster":
              parentArray = clusters[annotation.parent.id];
              break;
            case "block":
              parentArray = blocks[annotation.parent.id];
              break;
            case "map":
              parentArray = maps[annotation.parent.id] || [];
              maps[annotation.parent.id] = parentArray;
              break;
          }
          if (parentArray) {
            parentArray.push({
              name: ((_a = annotation.properties) == null ? void 0 : _a.name) || annotation.name,
              position: annotation.transform.position,
              quat: annotation.transform.rotation,
              scale: annotation.transform.scale,
              origin: annotation
            });
          } else {
            console.warn(`annotation ${((_b = annotation.properties) == null ? void 0 : _b.name) || annotation.name} \u672A\u627E\u5230parent`, annotation);
          }
        } else if (annotation.type) {
          switch (annotation.type) {
            case "relationship":
              relationships.push(annotation);
              break;
            case "block":
              break;
            case "map":
              break;
            default:
              console.log(`unexpected type`, annotation.type);
              break;
          }
        } else {
          console.warn(`annotation ${((_c = annotation.properties) == null ? void 0 : _c.name) || annotation.name} \u6CA1\u6709parent`, annotation);
        }
      }
    return { clusters, blocks, maps, relationships };
  }
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  function base64ToArrayBuffer(base64) {
    let bufferLength = base64.length * 0.75;
    const len = base64.length;
    let i, p = 0, encoded1, encoded2, encoded3, encoded4;
    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }
    const arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
    for (i = 0; i < len; i += 4) {
      encoded1 = lookup[base64.charCodeAt(i)];
      encoded2 = lookup[base64.charCodeAt(i + 1)];
      encoded3 = lookup[base64.charCodeAt(i + 2)];
      encoded4 = lookup[base64.charCodeAt(i + 3)];
      bytes[p++] = encoded1 << 2 | encoded2 >> 4;
      bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
      bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
    }
    return arraybuffer;
  }
  const text = function(l) {
    function m() {
    }
    function k(a, c) {
      a = void 0 === a ? "utf-8" : a;
      c = void 0 === c ? { fatal: false } : c;
      if (-1 === r.indexOf(a.toLowerCase()))
        throw new RangeError("Failed to construct 'TextDecoder': The encoding label provided ('" + a + "') is invalid.");
      if (c.fatal)
        throw Error("Failed to construct 'TextDecoder': the 'fatal' option is unsupported.");
    }
    function t(a) {
      return Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString("utf-8");
    }
    function u(a) {
      var c = URL.createObjectURL(new Blob([a], { type: "text/plain;charset=UTF-8" }));
      try {
        var f = new XMLHttpRequest();
        f.open("GET", c, false);
        f.send();
        return f.responseText;
      } catch (e) {
        return q(a);
      } finally {
        URL.revokeObjectURL(c);
      }
    }
    function q(a) {
      for (var c = 0, f = Math.min(65536, a.length + 1), e = new Uint16Array(f), h = [], d = 0; ; ) {
        var b = c < a.length;
        if (!b || d >= f - 1) {
          h.push(String.fromCharCode.apply(null, e.subarray(0, d)));
          if (!b)
            return h.join("");
          a = a.subarray(c);
          d = c = 0;
        }
        b = a[c++];
        if (0 === (b & 128))
          e[d++] = b;
        else if (192 === (b & 224)) {
          var g = a[c++] & 63;
          e[d++] = (b & 31) << 6 | g;
        } else if (224 === (b & 240)) {
          g = a[c++] & 63;
          var n = a[c++] & 63;
          e[d++] = (b & 31) << 12 | g << 6 | n;
        } else if (240 === (b & 248)) {
          g = a[c++] & 63;
          n = a[c++] & 63;
          var v = a[c++] & 63;
          b = (b & 7) << 18 | g << 12 | n << 6 | v;
          65535 < b && (b -= 65536, e[d++] = b >>> 10 & 1023 | 55296, b = 56320 | b & 1023);
          e[d++] = b;
        }
      }
    }
    if (l.TextEncoder && l.TextDecoder)
      return l;
    var r = ["utf-8", "utf8", "unicode-1-1-utf-8"];
    Object.defineProperty(m.prototype, "encoding", { value: "utf-8" });
    m.prototype.encode = function(a, c) {
      c = void 0 === c ? { stream: false } : c;
      if (c.stream)
        throw Error("Failed to encode: the 'stream' option is unsupported.");
      c = 0;
      for (var f = a.length, e = 0, h = Math.max(
        32,
        f + (f >>> 1) + 7
      ), d = new Uint8Array(h >>> 3 << 3); c < f; ) {
        var b = a.charCodeAt(c++);
        if (55296 <= b && 56319 >= b) {
          if (c < f) {
            var g = a.charCodeAt(c);
            56320 === (g & 64512) && (++c, b = ((b & 1023) << 10) + (g & 1023) + 65536);
          }
          if (55296 <= b && 56319 >= b)
            continue;
        }
        e + 4 > d.length && (h += 8, h *= 1 + c / a.length * 2, h = h >>> 3 << 3, g = new Uint8Array(h), g.set(d), d = g);
        if (0 === (b & 4294967168))
          d[e++] = b;
        else {
          if (0 === (b & 4294965248))
            d[e++] = b >>> 6 & 31 | 192;
          else if (0 === (b & 4294901760))
            d[e++] = b >>> 12 & 15 | 224, d[e++] = b >>> 6 & 63 | 128;
          else if (0 === (b & 4292870144))
            d[e++] = b >>> 18 & 7 | 240, d[e++] = b >>> 12 & 63 | 128, d[e++] = b >>> 6 & 63 | 128;
          else
            continue;
          d[e++] = b & 63 | 128;
        }
      }
      return d.slice ? d.slice(0, e) : d.subarray(0, e);
    };
    Object.defineProperty(k.prototype, "encoding", { value: "utf-8" });
    Object.defineProperty(k.prototype, "fatal", { value: false });
    Object.defineProperty(k.prototype, "ignoreBOM", { value: false });
    var p = q;
    "function" === typeof Buffer && Buffer.from ? p = t : "function" === typeof Blob && "function" === typeof URL && "function" === typeof URL.createObjectURL && (p = u);
    k.prototype.decode = function(a, c) {
      c = void 0 === c ? { stream: false } : c;
      if (c.stream)
        throw Error("Failed to decode: the 'stream' option is unsupported.");
      a = a instanceof Uint8Array ? a : a.buffer instanceof ArrayBuffer ? new Uint8Array(a.buffer) : new Uint8Array(a);
      return p(a);
    };
    l.TextEncoder = m;
    l.TextDecoder = k;
    return l;
  }("undefined" !== typeof window ? window : "undefined" !== typeof global ? global : globalThis);
  const _PoseFusion = class {
    constructor() {
      __publicField(this, "currentFusion");
      __publicField(this, "poseFusionResult");
      __publicField(this, "_enable", true);
      __publicField(this, "poseFusions");
      __publicField(this, "localFusion");
      __publicField(this, "lastFusion");
      __publicField(this, "isSlerp");
      __publicField(this, "sFusion");
      __publicField(this, "slerpTimestamp");
      __publicField(this, "_isTimeFeature", false);
      this._enable = true;
      this.poseFusions = [];
      this.localFusion = null;
      this.currentFusion = null;
      this.lastFusion = null;
      this.poseFusionResult = null;
    }
    static getInstance() {
      if (!this._instance) {
        this._instance = new _PoseFusion();
      }
      return this._instance;
    }
    get isTimeFeature() {
      return this._isTimeFeature;
    }
    set isTimeFeature(value) {
      if (this._isTimeFeature == value)
        return;
      this.currentFusion = null;
      this.poseFusionResult = null;
      this._isTimeFeature = value;
      this._enable = !value;
    }
    get enable() {
      return this._enable;
    }
    set enable(value) {
      if (this._enable == value)
        return;
      if (value) {
        this.currentFusion = null;
        this.poseFusionResult = null;
        this._updateCurrentFusion();
      } else {
        this._updateLocalFusion();
      }
      this._enable = value;
    }
    insertData(arKitPos, clsPose, timestamp) {
      let param = {
        localTwc: { data: arKitPos },
        mapTcw: { data: clsPose },
        timestamp: timestamp / 1e3
      };
      this.poseFusions.push(param);
      let sliceIdx = 0;
      while (param.timestamp - this.poseFusions[sliceIdx].timestamp > 90)
        sliceIdx++;
      if (sliceIdx > 0)
        this.poseFusions = this.poseFusions.slice(sliceIdx);
      if (this._isTimeFeature) {
        this._updateTimeFeatureFusion();
        return Promise.resolve({
          status: 1,
          fusionPose: Array.from(this.localFusion.clone().transpose().getInverse().data)
        });
      }
      return new Promise((resolve) => {
        if (this._enable) {
          this._updateCurrentFusion().then(() => {
            var _a, _b;
            resolve({
              status: (_a = this.poseFusionResult) == null ? void 0 : _a.status,
              fusionPose: (_b = this.poseFusionResult) == null ? void 0 : _b.transform.data
            });
          });
        } else {
          this._updateLocalFusion();
          resolve({
            status: 0,
            fusionPose: Array.from(this.localFusion.clone().transpose().getInverse().data)
          });
        }
      });
    }
    _updateLocalFusion() {
      if (this.poseFusions.length < 1)
        return;
      const lastFusionItem = this.poseFusions[this.poseFusions.length - 1];
      const { localTwc, mapTcw } = lastFusionItem;
      this.localFusion = new Mat4().mul2(
        new Mat4().set(localTwc.data).transpose(),
        new Mat4().set(mapTcw.data).transpose()
      );
    }
    _updateCurrentFusion() {
      if (this.poseFusions.length < 1)
        return;
      return getPoseFusion(this.poseFusions, (res) => {
        const _lastResult = this.poseFusionResult ? this.poseFusionResult : res.result;
        this.poseFusionResult = res.result;
        if (this.poseFusionResult.status < _lastResult.status || this.poseFusionResult.timestamp < _lastResult.timestamp)
          return;
        const _pose = new Mat4().set(this.poseFusionResult.transform.data).transpose();
        const inv_pose = _pose.clone().getInverse();
        const temp_lastFusion = this.currentFusion ? this.currentFusion : inv_pose;
        const temp_currentFusion = inv_pose;
        this.isSlerp = !_PoseFusion.sim3DifferenceIsTooBig(
          temp_lastFusion,
          temp_currentFusion
        );
        if (this.isSlerp) {
          this.sFusion = this.sFusion ? this.sFusion : temp_lastFusion;
          this.lastFusion = this.sFusion;
          this.slerpTimestamp = new Date().getTime();
        }
        this.currentFusion = temp_currentFusion;
      });
    }
    _updateTimeFeatureFusion() {
      if (this.poseFusions.length < 1)
        return Promise.reject("poseFusion empty");
      return new Promise((rl, rj) => {
        const { localTwc, mapTcw } = this.poseFusions[this.poseFusions.length - 1];
        this.localFusion = new Mat4().mul2(new Mat4().set(localTwc.data).transpose(), new Mat4().set(mapTcw.data).transpose());
        this.sFusion = this.sFusion || this.localFusion;
        this.lastFusion = this.sFusion;
        rl(null);
      });
    }
    getPoseInMap(vm) {
      if (this._isTimeFeature) {
        return this.getTimeFeaturePose(vm);
      }
      if (typeof vm[0] == "number")
        vm = new Mat4().set(vm);
      const fusion = this._enable && this.currentFusion ? this.currentFusion : this.localFusion;
      if (!fusion)
        return null;
      if (this._enable && this.isSlerp) {
        const _time = (new Date().getTime() - this.slerpTimestamp) / 1e3;
        const ratio = Math.min(1, _time);
        this.sFusion = _PoseFusion.averageResult(this.lastFusion, fusion, ratio);
      } else {
        this.sFusion = fusion;
      }
      let _pose = new Mat4().mul2(vm.clone(), this.sFusion.clone()).getInverse();
      return this.norm(_pose.data);
    }
    getTimeFeaturePose(vm) {
      if (typeof vm[0] == "number")
        vm = new Mat4().set(vm);
      const fusion = this.localFusion;
      if (!fusion)
        return null;
      let _pose = null;
      if (this.poseFusions.length < 2 || !_PoseFusion.sim3DifferenceIsTooBig(this.lastFusion, fusion)) {
        this.sFusion = fusion;
      } else {
        const lastLocTimestamp = this.poseFusions[this.poseFusions.length - 1].timestamp;
        const _time = Date.now() / 1e3 - lastLocTimestamp;
        const ratio = Math.min(1, _time);
        this.sFusion = _PoseFusion.averageResult(this.lastFusion, fusion, ratio);
      }
      _pose = new Mat4().mul2(vm.clone(), this.sFusion.clone()).getInverse();
      return this.norm(_pose.data);
    }
    norm(poseData) {
      const _norm = Math.sqrt(
        poseData[0] * poseData[0] + poseData[4] * poseData[4] + poseData[8] * poseData[8]
      );
      const norm_data = poseData.map((num, index) => {
        if (index < 12 && index % 4 < 3) {
          return num / _norm;
        } else {
          return num;
        }
      });
      norm_data[15] = 1;
      return norm_data;
    }
    clearFusion() {
      this.poseFusions = [];
      this.poseFusionResult = null;
    }
    static sim3DifferenceIsTooBig(lastResult, currentResult) {
      const lastTran = lastResult.decompose();
      const currentTran = currentResult.decompose();
      const _data = lastTran.rotation.getInverse().mul(currentTran.rotation).data;
      let deltaRadian = (_data[0] + _data[5] + _data[10] + _data[15] - 1.000001) / 2;
      if (deltaRadian >= 1)
        deltaRadian = 1;
      if (deltaRadian <= -1)
        deltaRadian = -1;
      const deltaOmiga = Math.acos(deltaRadian) * 180 / Math.PI;
      const deltaT_pos = {
        x: lastTran.position.x - currentTran.position.x,
        y: lastTran.position.y - currentTran.position.y,
        z: lastTran.position.z - currentTran.position.z
      };
      const deltaT = Math.sqrt(
        deltaT_pos.x * deltaT_pos.x + deltaT_pos.y * deltaT_pos.y + deltaT_pos.z * deltaT_pos.z
      );
      if (deltaT > 5 || deltaOmiga > 90) {
        return true;
      } else {
        return false;
      }
    }
    static averageResult(lastResult, currentResult, ratio) {
      const _lastTans = lastResult.decompose();
      const _currentTrans = currentResult.decompose();
      const _lastQuat = new Quat().setFromMat4(lastResult);
      const _currentQuat = new Quat().setFromMat4(currentResult);
      const tempPos = {
        x: _lastTans.position.x * (1 - ratio) + _currentTrans.position.x * ratio,
        y: _lastTans.position.y * (1 - ratio) + _currentTrans.position.y * ratio,
        z: _lastTans.position.z * (1 - ratio) + _currentTrans.position.z * ratio
      };
      const tempScale = {
        x: _lastTans.scale.x * (1 - ratio) + _currentTrans.scale.x * ratio,
        y: _lastTans.scale.y * (1 - ratio) + _currentTrans.scale.y * ratio,
        z: _lastTans.scale.z * (1 - ratio) + _currentTrans.scale.z * ratio
      };
      const tempQuat = new Quat().slerp(_lastQuat, _currentQuat, ratio);
      tempQuat.w = -tempQuat.w;
      return new Mat4().setTRS(tempPos, tempQuat, tempScale);
    }
  };
  let PoseFusion = _PoseFusion;
  __publicField(PoseFusion, "_instance", null);
  class CLSClient {
    constructor(config$1) {
      __publicField(this, "config");
      __publicField(this, "token");
      __publicField(this, "clsdata", {});
      var _a;
      assert(config$1.apiKey, "apiKey \u4E0D\u4E3A\u7A7A");
      assert(config$1.apiSecret, "apiSecret \u4E0D\u4E3A\u7A7A");
      assert(config$1.clsAppId, "clsAppId \u4E0D\u4E3A\u7A7A");
      if (!config$1.arannotationId && config$1.debug)
        console.log(`!arannotationId,\u5C06\u83B7\u53D6\u6240\u6709\u6807\u6CE8\u6570\u636E`);
      this.config = config$1;
      if (this.config.useCache === void 0)
        this.config.useCache = true;
      if (config$1.serverConfig) {
        Object.assign(config, config$1.serverConfig);
      }
      this.config.autoFilterEma = (_a = config$1.autoFilterEma) != null ? _a : true;
      this.config.debug && console.log(`autoFilterEma=true,\u5C06\u5F00\u542F\u8FC7\u6EE4\u6807\u6CE8\u6570\u636E\u6A21\u5F0F`);
    }
    setConfig(config$1, reset) {
      var _a;
      reset != null ? reset : reset = true;
      assert(config$1.apiKey, "apiKey \u4E0D\u4E3A\u7A7A");
      assert(config$1.apiSecret, "apiSecret \u4E0D\u4E3A\u7A7A");
      assert(config$1.clsAppId, "clsAppId \u4E0D\u4E3A\u7A7A");
      if (!config$1.arannotationId && config$1.debug)
        console.log(`!arannotationId,\u5C06\u83B7\u53D6\u6240\u6709\u6807\u6CE8\u6570\u636E`);
      Object.assign(this.config, config$1);
      if (config$1.serverConfig) {
        Object.assign(config, config$1.serverConfig);
      }
      this.config.autoFilterEma = (_a = config$1.autoFilterEma) != null ? _a : true;
      this.config.debug && console.log(`autoFilterEma=true,\u5C06\u5F00\u542F\u8FC7\u6EE4\u6807\u6CE8\u6570\u636E\u6A21\u5F0F`);
      if (reset)
        this.clsdata = {};
    }
    getConfig() {
      return this.config;
    }
    async getToken() {
      this.token = await getToken(this.config.apiKey, this.config.apiSecret);
      return this.token;
    }
    async getVersion() {
      if (this.config.useCache && this.clsdata.clsVersion)
        return this.clsdata.clsVersion;
      const clsVersionRes = await getClsInfoAnonymous(this.config.clsAppId);
      this.clsdata.clsVersion = clsVersionRes.version;
      return this.clsdata.clsVersion;
    }
    async getClsHost() {
      if (this.config.useCache && this.clsdata.clsHost)
        return this.clsdata.clsHost;
      await this.getVersion();
      this.clsdata.clsHost = getClsHost(this.clsdata.clsVersion);
      return this.clsdata.clsHost;
    }
    async getArannotations() {
      if (this.config.useCache && this.clsdata.arannotations)
        return this.clsdata.arannotations;
      await this.getToken();
      await this.getClsHost();
      let araRes = await getArannotations(this.clsdata.clsHost, this.config.clsAppId, this.token);
      let { arannotations } = araRes.result;
      this.clsdata.arannotations = arannotations;
      return this.clsdata.arannotations;
    }
    async getArannotationsDetail() {
      if (this.config.useCache && this.clsdata.arannotationsDetail)
        return this.clsdata.arannotationsDetail;
      const arannotations = await this.getArannotations();
      const arannotationsDetail = await Promise.all(arannotations.map((ara) => this._getEmaByArannotaionId(ara.arannotationId)));
      Object.assign(this.clsdata, { arannotationsDetail });
      return this.clsdata;
    }
    async getBlocksOnly() {
      var _a, _b, _c, _d;
      if (!((_b = (_a = this.clsdata) == null ? void 0 : _a.ema) == null ? void 0 : _b.blocks))
        await this.getArannotationDetail(void 0, { ema: true, meta: false, autoFilterEma: false });
      return ((_d = (_c = this.clsdata) == null ? void 0 : _c.ema) == null ? void 0 : _d.blocks) || [];
    }
    async getArannotationDetail(arannotationId, config2) {
      if (!config2)
        config2 = { ema: true, meta: true, autoFilterEma: true };
      const arannotations = await this.getArannotations();
      arannotationId = arannotationId != null ? arannotationId : this.config.arannotationId;
      assert(arannotationId, "arannotationId\u4E0D\u80FD\u4E3A\u7A7A");
      let ara = arannotations.find((aras) => aras.arannotationId == arannotationId);
      if (!ara)
        return Promise.reject("arannotationId\u4E0D\u5B58\u5728");
      let clsdata = await this._getEmaByArannotaionId(ara.arannotationId, config2);
      Object.assign(this.clsdata, clsdata);
      return this.clsdata;
    }
    async _getEmaByArannotaionId(arannotationId, config$1) {
      var _a;
      if (!config$1)
        config$1 = { ema: true, meta: true, autoFilterEma: true };
      let res = await getArannotation(this.clsdata.clsHost, arannotationId, this.config.clsAppId, this.token);
      let clsdata = { ema: null, meta: null, emaClusters: null, emaBlocks: null, emaMaps: null, emaRelationships: null };
      const emaPromise = !(config$1.ema && res.result.emaUrl) ? Promise.resolve() : request(res.result.emaUrl.replace("https://large-spatialmaps.easyar.com", config.emaUrl || "/api/large-spatialmaps"), "GET", null, { "content-type": " " }, null).then((res2) => {
        var _a2, _b;
        clsdata.ema = res2;
        (_b = (_a2 = clsdata.ema) == null ? void 0 : _a2.blocks) == null ? void 0 : _b.map((block) => {
          if (block.transform) {
            if (block.transform instanceof Array) {
              let mat4 = new Mat4();
              mat4.set(block.transform);
              block.mat4 = mat4;
            } else if (block.transform.position && block.transform.rotation && block.transform.scale) {
              let mat4 = new Mat4().compose(block.transform.position, block.transform.rotation, block.transform.scale);
              block.mat4 = mat4;
            } else {
              throw new Error("config.transform \u65E2\u975E prs \u53C8\u975E number[]");
            }
          }
        });
        return res2;
      });
      const metaPromise = !(config$1.meta && res.result.metaUrl) ? Promise.resolve() : request(res.result.metaUrl, "GET", null, { "content-type": " " }, null).then((res2) => {
        clsdata.meta = res2;
        return res2;
      });
      const [ema, meta] = await Promise.all([emaPromise, metaPromise]);
      if (!((_a = config$1.autoFilterEma) != null ? _a : this.config.autoFilterEma))
        return clsdata;
      let { clusters, blocks, maps, relationships } = cubeListsFromEma(ema);
      clsdata.emaClusters = clusters;
      clsdata.emaBlocks = blocks;
      clsdata.emaMaps = maps;
      clsdata.emaRelationships = relationships;
      return clsdata;
    }
  }
  class Recognizer extends CLSClient {
    constructor(config2, getCameraWithParam, slam = false) {
      super(config2);
      __publicField(this, "inLoop", false);
      __publicField(this, "busy", false);
      __publicField(this, "request");
      __publicField(this, "fireOnce");
      __publicField(this, "data", {
        debug: 3,
        includePerf: false
      });
      __publicField(this, "canvas");
      __publicField(this, "context");
      __publicField(this, "cameraParam");
      __publicField(this, "location");
      __publicField(this, "multiMapHelper");
      __publicField(this, "frameInterval");
      __publicField(this, "frame");
      __publicField(this, "minInterval");
      __publicField(this, "onFound");
      __publicField(this, "onLost");
      __publicField(this, "onError");
      __publicField(this, "poseFusion");
      __publicField(this, "getCameraWithParam");
      if (getCameraWithParam) {
        this.getCameraWithParam = getCameraWithParam;
      }
      if (slam) {
        this.poseFusion = PoseFusion.getInstance();
      }
    }
    _beginLoop() {
      this.inLoop = true;
      this.busy = false;
    }
    _stopLoop() {
      if (this.request) {
        this.request.abort();
      }
      this.inLoop = false;
      this.busy = false;
    }
    start({ minInterval, onFound, onLost, onError }) {
      this.minInterval = minInterval || this.minInterval;
      this.onFound = onFound || this.onFound;
      this.onLost = onLost || this.onLost;
      this.onError = onError || this.onError;
      this._resetCameraParam();
      this._startFrameInterval();
      this._beginLoop();
    }
    stop() {
      this._stopLoop();
      clearInterval(this.frameInterval);
    }
    _startFrameInterval() {
      if (this.frameInterval)
        clearInterval(this.frameInterval);
      this.frameInterval = setInterval(() => {
        this._triggerFrame();
      }, this.minInterval, this);
    }
    async updateFrame() {
      if (!this.getCameraWithParam) {
        throw new Error("\u8BF7\u4F20\u5165 getCameraWithParam \u65B9\u6CD5");
      }
      let cameraImageWithPose = await this.getCameraWithParam();
      return cameraImageWithPose;
    }
    _triggerFrame() {
      if (this.busy)
        return;
      this.__trigger();
    }
    __trigger() {
      if (this.inLoop) {
        this.__fire();
      } else if (this.fireOnce) {
        this.fireOnce = false;
        this.__fire();
      }
    }
    run(frame) {
      this.fireOnce = true;
      if (frame)
        this.updateFrame();
      return this.__fire();
    }
    async __fire() {
      if (this.busy)
        return false;
      this.busy = true;
      let profile = {};
      let token = void 0;
      let res = null;
      await this.getToken().then((t) => token = t).then((_) => this.updateFrame()).then((cameraImageWithPose) => {
        profile.requestTime = cameraImageWithPose.timestamp;
        profile.requestCameraPos = cameraImageWithPose.cameraPos;
        profile.base64Time = new Date().getTime();
        if (cameraImageWithPose.intrinsics) {
          this.cameraParam = JSON.stringify(cameraImageWithPose.intrinsics);
        }
        let data = this.__composeRequestFile(cameraImageWithPose.base64Img, token);
        return this.__sendClsRequest(data);
      }).then((r) => {
        res = this.__clsResult(r, profile);
      }).catch((e) => {
        if (!(e && e.errMsg === "request:fail abort")) {
          res = this.__clsError(e, profile);
        }
      }).then(() => {
        this.busy = false;
      });
      return res;
    }
    __composeRequestFile(image, token) {
      let params = {
        appId: this.config.clsAppId,
        cameraParam: this.cameraParam
      };
      if (this.data.debug < 3)
        console.log("params", params);
      if (this.data.debug < 2)
        console.log("image", image);
      if (this.data.includePerf)
        params.tprofile = 1;
      let imageBuffer = base64ToArrayBuffer(image);
      let banr1 = Object.keys(params).map((key) => {
        return `\r
--XXX\r
Content-Disposition: form-data;name="${key}"\r
\r
` + params[key];
      }).join("") + '\r\n--XXX\r\nContent-Disposition: form-data;name="image"; filename="image.jpg"\r\nContent-Type: application/octet-stream\r\nContent-Transfer-Encoding: binary\r\n\r\n';
      let banr2 = "\r\n--XXX--";
      let textEncoder = new text.TextEncoder();
      let buffer1 = textEncoder.encode(banr1);
      let buffer2 = new Uint8Array(imageBuffer);
      let buffer3 = textEncoder.encode(banr2);
      let all = new Uint8Array(buffer1.length + buffer2.length + buffer3.length);
      all.set(buffer1, 0);
      all.set(buffer2, buffer1.length);
      all.set(buffer3, buffer1.length + buffer2.length);
      let arraybuffer = all.buffer;
      let version = this.clsdata.clsVersion;
      return {
        url: getClsUrl(version),
        data: arraybuffer,
        header: { "content-type": "multipart/form-data; boundary=XXX", Authorization: token }
      };
    }
    __sendClsRequest(requestOptions) {
      return new Promise((resolve, reject) => {
        let options = Object.assign({
          method: "POST",
          success: (res) => {
            resolve(res.data);
          },
          fail: (err) => {
            reject(err);
          },
          complete: () => {
            this.request = void 0;
          }
        }, requestOptions);
        this.request = wx.request(options);
      });
    }
    __clsResult(res, profile) {
      var _a, _b;
      let params = {};
      params.statusCode = res.statusCode;
      params.msg = res.msg;
      if (this.data.includePerf) {
        params.clientPerf = profile;
        if (res.perf) {
          params.serverPerf = res.perf;
        }
      }
      if (res.timestamp)
        params.timestamp = res.timestamp;
      if (res.statusCode === 0) {
        let result = res.result[0];
        params.result = result;
        let worlds = [];
        if (result.mapId && (this.clsdata.emaMaps || this.clsdata.emaBlocks)) {
          let mapCubeList = this.clsdata.emaMaps[result.mapId] || this.clsdata.emaBlocks[result.mapId];
          if (mapCubeList && mapCubeList.length) {
            let type = this.clsdata.emaMaps[result.mapId] ? "map" : "block";
            let worldTransform = processPoseSchema(result.pose);
            let cameraTransform = processPoseCamera(result.pose);
            worlds.push({ type, contents: mapCubeList, pose: result.pose, worldTransform, cameraTransform });
          }
        }
        params.worlds = worlds;
        if (this.poseFusion) {
          const arKitPos = Array.from(new Mat4().set(profile.requestCameraPos).clone().transpose().getInverse().data);
          this.poseFusion.insertData(arKitPos, result.pose, profile.requestTime).then((res2) => {
            var _a2;
            params.fusionsStatus = res2 == null ? void 0 : res2.status;
            params.fusionPose = res2 == null ? void 0 : res2.fusionPose;
            (_a2 = this.onFound) == null ? void 0 : _a2.call(this, params);
          });
        } else {
          (_a = this.onFound) == null ? void 0 : _a.call(this, params);
        }
      } else {
        (_b = this.onLost) == null ? void 0 : _b.call(this, params);
      }
      return params;
    }
    getPoseInMap(vm) {
      if (this.poseFusion) {
        return this.poseFusion.getPoseInMap(vm);
      } else {
        console.error("getPoseInMap--> poseFusion is not exist");
        return Array.from(new Mat4().data);
      }
    }
    __clsError(err, profile) {
      var _a;
      let params = {};
      params.error = err;
      params.msg = err.errMsg;
      if (this.data.includePerf)
        params.clientPerf = profile;
      (_a = this.onError) == null ? void 0 : _a.call(this, params);
      return params;
    }
    _resetCameraParam() {
      let size = [480, 640];
      let focal = [544, 544];
      let canvas = this.canvas && this.canvas.width && { width: this.canvas.width, height: this.canvas.width * 4 / 3 } || { width: 480, height: 640 };
      let ratio = canvas.height / size[1];
      let focalLength = [focal[0] * ratio, focal[1] * ratio];
      let principalPoint = [canvas.width / 2, canvas.height / 2];
      this.cameraParam = "[" + focalLength[0] + "," + focalLength[1] + "," + principalPoint[0] + "," + principalPoint[1] + "]";
    }
  }
  exports2.CLSClient = CLSClient;
  exports2.Recognizer = Recognizer;
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
});

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1683552020091);
})()
//miniprogram-npm-outsideDeps=["abab","jssha"]
//# sourceMappingURL=index.js.map
// @flow

const assert = require('assert');

import type Context from '../gl/context';

export type UniformValues<Us: Object>
    = $Exact<$ObjMap<Us, <V>(u: Uniform<V>) => V>>;
export type UniformLocations = {[string]: WebGLUniformLocation};
export type UniformBindings = {[string]: any};
// binder uniforms are dynamically created:
export type BinderUniformTypes = any;

class Uniform<T> {
    context: Context;
    current: T;

    constructor(context: Context) {
        this.context = context;
    }
}

class Uniform1i extends Uniform<number> {
    set(location: WebGLUniformLocation, v: number): void {
        if (this.current !== v) {
            this.current = v;
            this.context.gl.uniform1i(location, v);
        }
    }
}

class Uniform1f extends Uniform<number> {
    set(location: WebGLUniformLocation, v: number): void {
        if (this.current !== v) {
            this.current = v;
            this.context.gl.uniform1f(location, v);
        }
    }
}

class Uniform2fv extends Uniform<[number, number]> {
    set(location: WebGLUniformLocation, v: [number, number]): void {
        const c = this.current;
        if (!this.current || v[0] !== [0] || v[1] !== c[1]) {
            this.current = v;
            this.context.gl.uniform2f(location, v[0], v[1]);
        }
    }
}

class Uniform3fv extends Uniform<[number, number, number]> {
    set(location: WebGLUniformLocation, v: [number, number, number]): void {
        const c = this.current;
        if (!this.current || v[0] !== [0] || v[1] !== c[1] || v[2] !== c[2]) {
            this.current = v;
            this.context.gl.uniform3f(location, v[0], v[1], v[2]);
        }
    }
}

class Uniform4fv extends Uniform<[number, number, number, number]> {
    set(location: WebGLUniformLocation, v: [number, number, number, number]): void {
        const c = this.current;
        if (!this.current || v[0] !== [0] || v[1] !== c[1] || v[2] !== c[2] || v[3] !== c[3]) {
            this.current = v;
            this.context.gl.uniform4f(location, v[0], v[1], v[2], v[3]);
        }
    }
}

class UniformMatrix4fv extends Uniform<Float32Array> {
    set(location: WebGLUniformLocation, v: Float32Array): void {
        let diff = !this.current;

        if (this.current) {
            for (let i = 0; i < 16; i++) {
                if (v[i] !== this.current[i]) {
                    diff = true;
                    break;
                }
            }
        }

        if (diff) {
            this.current = v;
            this.context.gl.uniformMatrix4fv(location, false, v);
        }
    }
}

class Uniforms<Us: UniformBindings> {
    bindings: Us;

    constructor(bindings: Us) {
        this.bindings = bindings;
    }

    set(uniformLocations: UniformLocations, uniformValues: UniformValues<Us>) {
        for (const name in uniformValues) {
            assert(this.bindings[name], `No binding with name ${name}`);
            this.bindings[name].set(uniformLocations[name], uniformValues[name]);
        }
    }
}

module.exports = {
    Uniform1i,
    Uniform1f,
    Uniform2fv,
    Uniform3fv,
    Uniform4fv,
    UniformMatrix4fv,
    Uniforms
};

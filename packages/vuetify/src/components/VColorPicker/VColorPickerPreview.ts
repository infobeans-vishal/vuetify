// Components
import VSlider from '../VSlider/VSlider'

// Utilities
import { RGBtoCSS, RGBAtoCSS } from '../../util/colorUtils'

// Types
import Vue, { VNode, VNodeData } from 'vue'
import { PropValidator } from 'vue/types/options'
import { VColorPickerColor, fromHsva } from './util'

export default Vue.extend({
  name: 'v-color-picker-preview',

  props: {
    color: Object as PropValidator<VColorPickerColor>,
    disabled: Boolean
  },

  methods: {
    genAlpha (): VNode {
      return this.genTrack({
        staticClass: 'v-color-picker__alpha',
        props: {
          thumbColor: 'grey lighten-2',
          hideDetails: true,
          value: this.color.alpha,
          step: 0,
          min: 0,
          max: 1
        },
        style: {
          backgroundImage: !this.disabled
            ? `linear-gradient(to right, transparent, ${RGBtoCSS(this.color.rgba)})`
            : undefined
        },
        on: {
          input: (val: number) => this.color.alpha !== val && this.$emit('update:color', fromHsva({ ...this.color.hsva, a: val }))
        }
      })
    },
    genColor (): VNode {
      return this.$createElement('div', {
        staticClass: 'v-color-picker__color'
      }, [
        this.genHue(),
        this.genAlpha()
      ])
    },
    genDot (): VNode {
      return this.$createElement('div', {
        staticClass: 'v-color-picker__dot'
      }, [
        this.$createElement('div', {
          staticClass: 'v-color-picker__dot-background'
        }),
        this.$createElement('div', {
          staticClass: 'v-color-picker__dot-foreground',
          style: {
            background: RGBAtoCSS(this.color.rgba)
          }
        })
      ])
    },
    genHue (): VNode {
      return this.genTrack({
        staticClass: 'v-color-picker__hue',
        props: {
          thumbColor: 'grey lighten-2',
          hideDetails: true,
          value: this.color.hue,
          step: 0,
          min: 0,
          max: 360
        },
        on: {
          input: (val: number) => this.color.hue !== val && this.$emit('update:color', fromHsva({ ...this.color.hsva, h: val }))
        }
      })
    },
    genTrack (options: VNodeData): VNode {
      return this.$createElement(VSlider, {
        class: 'v-color-picker__track',
        ...options,
        props: {
          disabled: this.disabled,
          ...options.props
        }
      })
    }
  },

  render (h): VNode {
    return h('div', {
      staticClass: 'v-color-picker__preview'
    }, [
      this.genDot(),
      this.genColor()
    ])
  }
})

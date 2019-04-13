// Components
import VBtn from '../VBtn'
import VIcon from '../VIcon'

// Helpers
import { parseHex } from '../../util/colorUtils'

// Types
import Vue, { VNode } from 'vue'
import { PropValidator } from 'vue/types/options'
import { VColorPickerColor, fromRgba, fromHexa, fromHsla } from './util'

type Input = [string, number, string]

export type Mode = {
  inputs?: Input[]
  from: Function
}

export const modes = {
  rgba: {
    inputs: [
      ['r', 255, 'int'],
      ['g', 255, 'int'],
      ['b', 255, 'int'],
      ['a', 1, 'float']
    ],
    from: fromRgba
  },
  hsla: {
    inputs: [
      ['h', 360, 'int'],
      ['s', 1, 'float'],
      ['l', 1, 'float'],
      ['a', 1, 'float']
    ],
    from: fromHsla
  },
  hexa: {
    from: fromHexa
  }
} as { [key: string]: Mode }

export default Vue.extend({
  name: 'v-color-picker-edit',

  props: {
    color: Object as PropValidator<VColorPickerColor>,
    disabled: Boolean,
    hideModeSwitch: Boolean,
    mode: {
      type: String,
      default: 'rgba'
    }
  },

  data () {
    return {
      modes,
      internalMode: this.mode
    }
  },

  computed: {
    currentMode (): Mode {
      return this.modes[this.internalMode]
    }
  },

  watch: {
    mode (mode) {
      this.internalMode = mode
    }
  },

  created () {
    this.internalMode = this.mode
  },

  methods: {
    getValue (v: any, type: string) {
      if (type === 'float') return Math.round(v * 100) / 100
      else if (type === 'int') return Math.round(v)
      else return 0
    },
    parseValue (v: string, type: string) {
      if (type === 'float') return parseFloat(v)
      else if (type === 'int') return parseInt(v, 10) || 0
      else return 0
    },
    changeMode () {
      const modes = Object.keys(this.modes)
      const index = modes.indexOf(this.internalMode)
      const newMode = modes[(index + 1) % modes.length]
      this.internalMode = newMode
      this.$emit('update:mode', newMode)
    },
    genInput (target: string, attrs: any, value: any, on: any): VNode {
      return this.$createElement('div', {
        staticClass: 'v-color-picker__input'
      }, [
        this.$createElement('input', {
          key: target,
          attrs,
          domProps: {
            value
          },
          on
        }),
        this.$createElement('span', target.toUpperCase())
      ])
    },
    genInputs (): VNode[] | VNode {
      switch (this.internalMode) {
        case 'hex': {
          const hex = this.color.hexa
          const value = hex.endsWith('FF') ? hex.substr(0, 6) : hex
          return this.genInput(
            this.internalMode,
            {
              maxlength: 9,
              disabled: this.disabled
            },
            `#${value}`,
            {
              change: (e: Event) => {
                const el = e.target as HTMLInputElement
                this.$emit('update:color', this.currentMode.from(parseHex(el.value)))
              }
            }
          )
        }
        default: {
          return this.currentMode.inputs!.map(([target, max, type]) => {
            const value = this.color[this.internalMode as keyof VColorPickerColor] as any
            return this.genInput(
              target,
              {
                type: 'number',
                min: 0,
                max,
                step: type === 'float' ? '0.01' : type === 'int' ? '1' : undefined,
                disabled: this.disabled
              },
              this.getValue(value[target], type),
              {
                input: (e: Event) => {
                  const el = e.target as HTMLInputElement
                  const newVal = this.parseValue(el.value || '0', type)

                  this.$emit('update:color', this.currentMode.from(
                    Object.assign({}, value, { [target]: newVal }),
                    this.color.alpha
                  ))
                }
              }
            )
          })
        }
      }
    },
    genSwitch (): VNode {
      return this.$createElement(VBtn, {
        props: {
          small: true,
          icon: true,
          disabled: this.disabled
        },
        on: {
          click: this.changeMode
        }
      }, [
        this.$createElement(VIcon, '$vuetify.icons.unfold')
      ])
    }
  },

  render (h): VNode {
    return h('div', {
      staticClass: 'v-color-picker__edit'
    }, [
      this.genInputs(),
      !this.hideModeSwitch && this.genSwitch()
    ])
  }
})

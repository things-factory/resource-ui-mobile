import { LitElement, html, css } from 'lit-element'

import '@things-factory/simple-ui'

const GUTTERS = [
  {
    type: 'gutter',
    name: 'sequence'
  },
  {
    type: 'gutter',
    name: 'row-selector'
  },
  {
    type: 'gutter',
    name: 'button',
    icon: 'edit'
  }
]

const PAGINATION = {
  pages: [20, 30, 50, 100, 200]
}

/**
 * @class DataListWrapper
 *
 * resource entity의 configuration을 의 불일치를 data-grist의 configuration으로 치환하는 클래스임.
 */
export class DataListWrapper extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: row;
      }

      data-grist {
        flex: 1;
      }
    `
  }

  static get properties() {
    return {
      mode: String,
      columns: Array,
      records: Array,
      limit: Number,
      page: Number,
      total: Number,
      _config: Object,
      _data: Object
    }
  }

  render() {
    return html`
      <data-grist
        .mode=${this.mode}
        .config=${this._config}
        .data=${this._data}
        @sorters-changed=${this.onSortersChanged.bind(this)}
      >
      </data-grist>
    `
  }

  onSortersChanged(e) {
    e.stopPropagation()
    this.dispatchEvent(
      new CustomEvent('sorters-changed', {
        detail: this.convertSorters(e.detail)
      })
    )
  }

  convertSorters(sorters) {
    return sorters.map(column => {
      return {
        name: column.name,
        reverseSort: column.descending
      }
    })
  }

  buildConfig() {
    var columns = this.columns.map(column => {
      let { name, gridWidth: width, gridAlign: align, term: header } = column
      let refType = column.refType && column.refType.toLowerCase()
      let type = column.colType
      if ((refType && refType === 'entity') || refType === 'menu') {
        type = 'object'
      }

      return {
        name,
        type,
        hidden: false,
        width,
        resizable: true,
        sortable: true,
        header,
        // header: {
        //   renderer: headerRenderer,
        //   decorator: ''
        // },
        record: {
          // renderer: '',
          // editor: '',
          // decorator: '',
          align
        }
      }
    })

    var sorters = this.columns.filter(column => column.sortRank)

    return {
      columns: [...GUTTERS, ...columns],
      pagination: {
        ...PAGINATION,
        infinite: false
      },
      sorters: this.convertSorters(sorters)
    }
  }

  updated(changes) {
    if (changes.has('columns')) {
      this.records = []
      this._config = this.buildConfig()
    }

    if (changes.has('records') || changes.has('page') || changes.has('limit') || changes.has('total')) {
      this._data = {
        records: this.records,
        limit: this.limit,
        page: this.page,
        total: this.total
      }
    }
  }
}

customElements.define('data-list-wrapper', DataListWrapper)

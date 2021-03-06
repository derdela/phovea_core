/**
 * Created by sam on 26.12.2016.
 */


import {IVisMetaData, IVisPluginDesc} from '../../vis';

/**
 * @internal
 */
export class ProxyMetaData implements IVisMetaData {
  constructor(private proxy: () => IVisMetaData) {

  }

  get scaling() {
    const p = this.proxy();
    return p ? p.scaling : 'free';
  }

  get rotation() {
    const p = this.proxy();
    return p ? p.rotation : 0;
  }

  get sizeDependsOnDataDimension() {
    const p = this.proxy();
    return p ? p.sizeDependsOnDataDimension : [false, false];
  }
}
/**
 * @internal
 */
export function selectVis(initial: number|string|IVisPluginDesc, visses: IVisPluginDesc[]) {
  switch (typeof initial) {
    case 'number':
      return visses[Math.max(0, Math.min(<number>initial, visses.length - 1))];
    case 'string':
      return visses[Math.max(0, visses.findIndex((v) => v.id === <string>initial))];
    default:
      return visses[Math.max(0, visses.indexOf(<IVisPluginDesc>initial))];
  }
}

/**
 * @internal
 */
export function clearNode(parent: Element) {
  let node = parent.firstChild;
  while ((node = parent.firstChild) != null) {
    parent.removeChild(node);
  }
}
/**
 * @internal
 */
export function createNode(parent: HTMLElement, type: string = 'div', clazz?: string) {
  const node = parent.ownerDocument.createElement(type);
  if (clazz) {
    clazz.split(' ').forEach((c) => node.classList.add(c));
  }
  parent.appendChild(node);
  return node;
}

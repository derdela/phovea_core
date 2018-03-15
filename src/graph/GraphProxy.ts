/**
 * Created by sam on 12.02.2015.
 */
import {resolve as idtypes_resolve} from '../idtype';
import {ADataType} from '../datatype';
import {all, none, Range, RangeLike} from '../range';
import {AGraph, IDTYPE_EDGES, IDTYPE_NODES, DIM_EDGES, DIM_NODES} from './graph';
import {defaultGraphFactory, IGraphFactory, IGraphDataDescription} from './GraphBase';
import RemoteStoreGraph from './RemoteStorageGraph';
import MemoryGraph from './MemoryGraph';
import LocalStorageGraph from './LocalStorageGraph';
import {resolveImmediately} from '../internal/promise';

export default class GraphProxy extends ADataType<IGraphDataDescription> {
  private cache: PromiseLike<AGraph> = null;
  private loaded: AGraph = null;

  constructor(desc: IGraphDataDescription) {
    super(desc);
  }

  get nnodes(): number {
    if (this.loaded) {
      return this.loaded.nnodes;
    }
    const size = this.desc.size;
    return size[DIM_NODES] || 0;
  }

  get nedges(): number {
    if (this.loaded) {
      return this.loaded.nedges;
    }
    const size = this.desc.size;
    return size[DIM_EDGES] || 0;
  }

  get dim() {
    return [this.nnodes, this.nedges];
  }

  impl(factory: IGraphFactory = defaultGraphFactory): PromiseLike<AGraph> {
    if (this.cache) {
      return this.cache;
    }
    const type = this.desc.storage || 'remote';
    if (type === 'memory') {
      //memory only
      this.loaded = new MemoryGraph(this.desc, [], [], factory);
      this.cache = resolveImmediately(this.loaded);
    } else if (type === 'local') {
      this.loaded = LocalStorageGraph.load(this.desc, factory, localStorage);
      this.cache = resolveImmediately(this.loaded);
    } else if (type === 'session') {
      this.loaded = LocalStorageGraph.load(this.desc, factory, sessionStorage);
      this.cache = resolveImmediately(this.loaded);
    } else if (type === 'given' && this.desc.graph instanceof AGraph) {
      this.loaded = this.desc.graph;
      this.cache = resolveImmediately(this.loaded);
    } else {
      this.cache = resolveImmediately(RemoteStoreGraph.load(this.desc, factory)).then((graph: AGraph) => this.loaded = graph);
    }
    return this.cache;
  }

  ids(range: RangeLike = all()): Promise<Range> {
    if (this.cache) {
      return Promise.resolve(<any>this.cache.then((i) => i.ids(range))); // TODO avoid <any> type cast
    }
    return Promise.resolve(none());
  }

  get idtypes() {
    return [IDTYPE_NODES, IDTYPE_EDGES].map(idtypes_resolve);
  }
}

/**
 * module entry point for creating a datatype
 * @param desc
 * @returns {IMatrix}
 */
export function create(desc: IGraphDataDescription): GraphProxy {
  return new GraphProxy(desc);
}

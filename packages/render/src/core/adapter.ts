import { CPage, CNode, CRootNode } from '@octopus/model';
import { ReactInstance } from 'react';
import { RefManager } from './refManager';
import { RenderInstance } from './type';
import { StoreManager } from './storeManager';

export type ContextType = {
  /** 渲染函数的入口参数 */
  params?: Record<any, any>;
  /** 全局状态 */
  globalState?: Record<any, any>;
  /** 更新全局状态 */
  updateGlobalState?: (newState: any) => void;
  /** 存储当前节点的数据，不具有响应性 **/
  staticVar?: Record<string | number, any>;
  getStaticVar?: () => Record<string, any>;
  getStaticVarById?: (nodeId: string) => Record<string, any>;
  methods?: Record<string, (...arg: any) => any>;
  getMethods?: () => Record<string, (...arg: any) => any>;
  getMethodsById?: (nodeId: string) => Record<string, (...arg: any) => any>;
  /** 当前节点状态 **/
  state?: Record<any, any>;
  /** 更新当前节点状态 */
  updateState?: (newState: any) => void;
  getState?: () => Record<any, any>;
  getStateById?: (nodeId: string) => Record<any, any>;
  updateStateById?: (nodeId: string, newState: Record<any, any>) => void;
  getStateObj?: () => {
    state?: Record<any, any>;
    updateState?: (newState: any) => void;
  };
  getStateObjById?: (nodeId: string) => {
    state?: Record<any, any>;
    updateState?: (newState: any) => void;
  };
  /**  用于访访问和管理页面被注册为全局的局部 state 快照，在闭包中使用会存在值不是最新的情况 */
  stateManager?: Record<string, any>;
  /** 循环数据 */
  loopData?: Record<any, any>;
  /** 组件节点的 Ref */
  refs?: RefManager;
  storeManager?: StoreManager;
  /** 第三方辅助库 */
  thirdLibs?: Record<string, any>;
};

export type RuntimeRenderHelper = {
  renderComponent: (
    node: CNode | CRootNode,
    options: {
      $$context: ContextType;
      idx?: number;
    }
  ) => any;
};

export type ComponentsType = Record<any, any>;

export type AdapterOptionType = {
  libs: Record<string, any>;
  components: ComponentsType;
  $$context: ContextType;
  onGetRef?: (ref: React.RefObject<React.ReactInstance>, nodeMode: CNode | CRootNode, instance: RenderInstance) => void;
  onGetComponent?: (component: (...args: any) => any, currentNode: CNode | CRootNode) => void;
  onComponentMount?: (instance: ReactInstance, node: CNode | CRootNode) => void;
  onComponentDestroy?: (instance: ReactInstance, node: CNode | CRootNode) => void;
  processNodeConfigHook?: (
    config: {
      condition: boolean;
      props: Record<string, any>;
    },
    node: CNode
  ) => {
    condition: boolean;
    props: Record<string, any>;
  };
  renderMode?: 'design' | 'normal';
};

// TODO: 后续考虑去掉
export interface AdapterType {
  renderMode?: AdapterOptionType['renderMode'];
  customPageRootRender?: (pageModel: CPage, options: AdapterOptionType) => any;
  // 页面渲染
  pageRender: (pageModel: CPage, options: AdapterOptionType) => any;
  // 将一个 组件 model 节点 转换为一个可被运行的渲染函数
  convertModelToComponent: (
    originalComponent: any,
    nodeModal: CNode | CRootNode,
    options: {
      pageModel: CPage;
      idx?: number;
    } & AdapterOptionType
  ) => any;
  // 渲染一个组件
  render: (originalComponent: any, props?: Record<any, any>, ...children: any[]) => any;
  // find target component render function
  getComponent: (currentNode: CNode | CRootNode, components: ComponentsType) => void;
  getContext: (data: Record<any, any>, ctx: ContextType | null) => ContextType;
  getUtils: () => void;
  // 获取数据域链
  getDataLink: () => void;
  createDataLink: () => void;
  transformProps: (originalProps: Record<any, any>, options: { $$context: Record<any, any> }) => Record<any, any>;
  transformData: () => void;
  transformGlobalData: () => void;
  errorCatch: () => void;
  // clear memory
  clear: () => void;
}

const notImplements = (msg: string) => {
  return () => {
    console.warn(`${msg} need to be implement getComponent`);
  };
};

// 高级的 render 渲染器，可以完全自定义
const CustomAdvanceAdapter = ['customPageRootRender'] as const;

const AdapterMethodList = [
  // 页面渲染
  'pageRender',
  // 渲染一个组件
  'render',
  // 将一个 组件 model 节点 转换为一个可被运行的渲染函数
  'convertModelToComponent',
  'getComponent',
  'getContext',
  'getUtils',
  'getDataLink',
  'createDataLink',
  'transformProps',
  'transformData',
  'transformGlobalData',
  'errorCatch',
  'clear',
] as const;

type CustomAdvanceAdapterMethodListType = typeof CustomAdvanceAdapter[number];

// 必须实现的方法
type AdapterMethodListType = typeof AdapterMethodList[number];

export const getAdapter = (defineAdapter: Partial<AdapterType>): AdapterType => {
  const adapter: AdapterType = [...AdapterMethodList, ...CustomAdvanceAdapter].reduce<
    Record<AdapterMethodListType, any>
  >((res, funcName) => {
    if (defineAdapter?.[funcName]) {
      res[funcName as AdapterMethodListType] = defineAdapter[funcName]?.bind(defineAdapter);
    } else {
      if (AdapterMethodList.includes(funcName as AdapterMethodListType)) {
        res[funcName as AdapterMethodListType] = notImplements;
      }
    }
    return res;
  }, {} as any);

  return adapter;
};

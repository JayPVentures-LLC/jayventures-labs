import fs from 'fs';
import yaml from 'js-yaml';

export interface JPVOsSpec {
  version: string;
  enforcement: string;
  principle: string;
  brands: Brand[];
  system_flow: SystemFlow;
  enforcement_rules: EnforcementRules;
}

export interface Brand {
  id: string;
  entity: string;
  layer: string;
  authority: string;
  revenue_channel: string;
  mission: {
    primary: string;
    directive: string;
  };
  function: string[];
  voice: {
    tone: string;
    style: string;
    perspective: string;
    constraints: string[];
  };
  language: {
    allow: string[];
    deny: string[];
  };
  routing: {
    inputs: string[];
    outputs: string[];
  };
  environments: string[];
}

export interface SystemFlow {
  sequence: string[];
  rules: string[];
}

export interface EnforcementRules {
  violations: string[];
  action: string[];
}

export function loadJPVOsSpec(path: string): JPVOsSpec {
  const file = fs.readFileSync(path, 'utf8');
  const doc = yaml.load(file) as any;
  return {
    version: doc.jpv_os.version,
    enforcement: doc.jpv_os.enforcement,
    principle: doc.jpv_os.principle,
    brands: doc.jpv_os.brands,
    system_flow: doc.jpv_os.system_flow,
    enforcement_rules: doc.jpv_os.enforcement_rules || { violations: [], action: [] },
  };
}

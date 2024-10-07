import * as fs from "fs";
import * as yaml from "js-yaml";
import { convertYamlPartnerToPartner, Partner, YamlPartner } from "./interface";




function loadYamlFile(filePath: string): YamlPartner {
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");    
    const data: YamlPartner = yaml.load(fileContents) as YamlPartner;
    return data;
  } catch (e) {
    throw new Error(`Failed to load YAML file: ${e}`);
  }
}

export function getJsonfromYaml(filePath: string): Partner {
  const yamlData = loadYamlFile(filePath);
  return convertYamlPartnerToPartner(yamlData);
}
import { readFileSync } from "fs";
import {load} from "js-yaml";
import { convertYamlPartnerToPartner, Partner, YamlPartner } from "./interface";

/**
 * Loads and parses a YAML file from the given file path.
 *
 * @param {string} filePath - The path to the YAML file.
 * @returns {YamlPartner} - The parsed YAML data as a YamlPartner object.
 * @throws {Error} - Throws an error if the file cannot be read or parsed.
 */
function loadYamlFile(filePath: string): YamlPartner {
  try {
    const fileContents = readFileSync(filePath, "utf8");    
    const data: YamlPartner = load(fileContents) as YamlPartner;
    return data;
  } catch (e) {
    throw new Error(`Failed to load YAML file: ${e}`);
  }
}

/**
 * Converts YAML data from a file into a Partner object.
 *
 * @param {string} filePath - The path to the YAML file.
 * @returns {Partner} - The converted Partner object.
 */
export function getJsonfromYaml(filePath: string): Partner {
  const yamlData = loadYamlFile(filePath);
  return convertYamlPartnerToPartner(yamlData);
}
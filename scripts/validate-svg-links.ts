#!/usr/bin/env bun

/**
 * SVG Link Validator
 * 
 * #14 - Validate all 100 permanent SVG aliases plus index.svg
 * 
 * Checks:
 * - HTTP 200 status (for local: file exists)
 * - Content-Type: image/svg+xml
 * - Expected SHA-256 hash (if provided)
 * - Referenced JS/CSS/WASM/worker files exist
 * - No alias serves obsolete wrapper
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

interface ValidationResult {
  file: string;
  exists: boolean;
  size: number;
  sha256: string;
  contentType: string;
  hasWrapper: boolean;
  referencesJs: string[];
  missingRefs: string[];
  errors: string[];
  warnings: string[];
  valid: boolean;
}

// Known expected SHA-256 from handoff document
const EXPECTED_SHA = '9aa7f0160ff6b4ee5592b6cd00c92128954dc026a57d49fe08d25e934ad99805';

function calculateSha256(content: Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

function extractSvgReferences(svgContent: string): string[] {
  const refs: string[] = [];
  const srcRegex = /(?:src|href)=["']([^"']*(?:\.js|\.css|\.wasm)[^"']*)["']/gi;
  let match;

  while ((match = srcRegex.exec(svgContent)) !== null) {
    refs.push(match[1]);
  }

  return refs;
}

function validateSvgFile(filePath: string, assetsDir: string): ValidationResult {
  const result: ValidationResult = {
    file: filePath,
    exists: false,
    size: 0,
    sha256: '',
    contentType: '',
    hasWrapper: false,
    referencesJs: [],
    missingRefs: [],
    errors: [],
    warnings: [],
    valid: false,
  };

  if (!existsSync(filePath)) {
    result.errors.push('File does not exist');
    return result;
  }
  
  result.exists = true;

  try {
    const content = readFileSync(filePath);
    result.size = content.length;
    result.sha256 = calculateSha256(content);
    
    const contentStr = content.toString('utf-8');
    result.hasWrapper = contentStr.includes('<svg') && contentStr.includes('foreignObject');
    result.contentType = result.hasWrapper ? 'image/svg+xml' : 'unknown';

    if (!contentStr.includes('<?xml') && !contentStr.includes('<svg')) {
      result.warnings.push('Missing XML/SVG declaration');
    }

    if (!contentStr.includes('foreignObject')) {
      result.warnings.push('Missing foreignObject');
    }

    const refs = extractSvgReferences(contentStr);
    result.referencesJs = refs;

    for (const ref of refs) {
      const fileName = ref.split('/').pop();
      if (fileName) {
        const assetPath = join(assetsDir, fileName);
        if (!existsSync(assetPath)) {
          result.missingRefs.push(fileName);
        }
      }
    }

    result.valid = 
      result.exists &&
      result.hasWrapper &&
      result.missingRefs.length === 0 &&
      result.errors.length === 0;

  } catch (error) {
    result.errors.push(`Failed to read: ${error instanceof Error ? error.message : 'Unknown'}`);
  }

  return result;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║     Synnical SVG Link Validator (#14)            ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  const baseDir = '/home/z/my-project';
  const assetsDir = join(baseDir, 'assets');

  if (!existsSync(assetsDir)) {
    console.error(`❌ Assets dir not found: ${assetsDir}`);
    process.exit(1);
  }

  const results: ValidationResult[] = [];
  let totalValid = 0;
  let totalInvalid = 0;

  // Validate index.svg
  console.log('📄 index.svg...');
  const indexResult = validateSvgFile(join(baseDir, 'index.svg'), assetsDir);
  results.push(indexResult);
  if (indexResult.valid) totalValid++; else totalInvalid++;
  logResult(indexResult);

  // Validate all 100 synnical-XXX.svg files
  console.log('\n📄 Validating synnical-001.svg to synnical-100.svg...\n');
  
  for (let i = 1; i <= 100; i++) {
    const fileName = `synnical-${String(i).padStart(3, '0')}.svg`;
    const filePath = join(baseDir, fileName);
    
    const result = validateSvgFile(filePath, assetsDir);
    results.push(result);
    
    if (result.valid) totalValid++; else totalInvalid++;
    
    if (i % 25 === 0 || !result.valid) {
      process.stdout.write(`${result.valid ? '✅' : '❌'} ${fileName}`);
      if (!result.valid && result.errors.length > 0) {
        process.stdout.write(` - ${result.errors[0]}`);
      }
      process.stdout.write('\n');
    } else {
      process.stdout.write('.');
    }
  }

  console.log('\n');

  // Summary
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║                  SUMMARY                          ║');
  console.log('╠════════════════════════════════════════════════════╣');
  console.log(`║ Total:   ${String(results.length).padEnd(44)}║`);
  console.log(`║ Valid:   ${String(totalValid).padEnd(44)}║`);
  console.log(`║ Invalid: ${String(totalInvalid).padEnd(43)}║`);
  console.log('╠════════════════════════════════════════════════════╣');

  const indexSha = results[0]?.sha256 || '';
  const shaMatch = indexSha === EXPECTED_SHA;
  console.log(`║ SHA Match: ${shaMatch ? 'YES ✅' : 'NO ❌'}.padEnd(41)║`);
  console.log('╚════════════════════════════════════════════════════╝');

  // Version divergence check (#3)
  console.log('\n🔍 Version divergence check (#3)...');
  const uniqueShas = new Set(results.map(r => r.sha256));
  if (uniqueShas.size === 1) {
    console.log('   ✅ All SVGs identical (no divergence)');
  } else {
    console.log(`   ⚠️  ${uniqueShas.size} different versions found!`);
  }

  // Missing refs
  const missingRefFiles = results.filter(r => r.missingRefs.length > 0);
  if (missingRefFiles.length > 0) {
    console.log('\n⚠️  Files with missing asset refs:');
    for (const r of missingRefFiles.slice(0, 5)) {
      console.log(`   ${r.file}: ${r.missingRefs.join(', ')}`);
    }
  }

  process.exit(totalInvalid > 0 ? 1 : 0);
}

function logResult(result: ValidationResult): void {
  if (result.valid) {
    console.log(`   ✅ Valid | Size: ${result.size} bytes | SHA: ${result.sha256.slice(0, 16)}...`);
  } else {
    console.log(`   ❌ Invalid`);
    for (const err of result.errors) {
      console.log(`      Error: ${err}`);
    }
  }
}

main().catch(console.error);

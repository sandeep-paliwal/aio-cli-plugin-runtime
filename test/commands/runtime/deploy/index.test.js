/*
Copyright 2019 Adobe Inc. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { stdout } = require('stdout-stderr')
const TheCommand = require('../../../../src/commands/runtime/deploy/index.js')
const RuntimeBaseCommand = require('../../../../src/RuntimeBaseCommand.js')
const ow = require('openwhisk')()
const owPackage = 'packages.update'
const owAction = 'actions.update'
const owAPI = 'routes.create'
const owTriggers = 'triggers.update'
const owRules = 'rules.update'

test('exports', async () => {
  expect(typeof TheCommand).toEqual('function')
  expect(TheCommand.prototype instanceof RuntimeBaseCommand).toBeTruthy()
})

test('description', async () => {
  expect(TheCommand.description).toBeDefined()
})

test('aliases', async () => {
  expect(TheCommand.aliases).toEqual([])
})

test('flags', async () => {
  expect(TheCommand.flags.manifest.required).toBe(false)
  expect(TheCommand.flags.manifest.hidden).toBe(false)
  expect(TheCommand.flags.manifest.multiple).toBe(false)
  expect(TheCommand.flags.manifest.char).toBe('m')
  expect(typeof TheCommand.flags.manifest).toBe('object')
  expect(TheCommand.flags.param.required).toBe(false)
  expect(TheCommand.flags.param.hidden).toBe(false)
  expect(TheCommand.flags.param.multiple).toBe(true)
  expect(typeof TheCommand.flags.param).toBe('object')
  expect(TheCommand.flags['param-file'].required).toBe(false)
  expect(TheCommand.flags['param-file'].hidden).toBe(false)
  expect(TheCommand.flags['param-file'].multiple).toBe(false)
  expect(TheCommand.flags['param-file'].char).toBe('P')
  expect(typeof TheCommand.flags['param-file']).toBe('object')
})

describe('instance methods', () => {
  let command
  let cwdSpy

  beforeAll(() => {
    cwdSpy = jest.spyOn(process, 'cwd').mockImplementation(() => {
      return ('/deploy')
    })
  })

  afterAll(() => {
    cwdSpy.mockRestore()
  })

  beforeEach(() => {
    command = new TheCommand([])
    const json = {
      'deploy/parameters.json': fixtureFile('deploy/parameters.json'),
      'deploy/apis_not_implemented.yml': fixtureFile('deploy/apis_not_implemented.yml'),
      'deploy/sequences_implemented.yml': fixtureFile('deploy/sequences_implemented.yml'),
      'deploy/manifest_triggersRules.yaml': fixtureFile('deploy/manifest_triggersRules.yaml'),
      'deploy/manifest_triggersRules_IncorrectAction.yaml': fixtureFile('deploy/manifest_triggersRules_IncorrectAction.yaml'),
      'deploy/manifest_triggersRules_noInputs.yaml': fixtureFile('deploy/manifest_triggersRules_noInputs.yaml'),
      'deploy/manifest.yaml': fixtureFile('deploy/manifest.yaml'),
      'deploy/manifest_report.yaml': fixtureFile('deploy/manifest_report.yaml'),
      'deploy/manifest_not_webAction.yaml': fixtureFile('deploy/manifest_not_webAction.yaml'),
      'deploy/manifest_not_webSequence.yaml': fixtureFile('deploy/manifest_not_webSequence.yaml'),
      'deploy/manifest_webSequence.yaml': fixtureFile('deploy/manifest_webSequence.yaml'),
      'deploy/deployment_triggersMissingInputs.yaml': fixtureFile('deploy/deployment_triggersMissingInputs.yaml'),
      'deploy/deployment_triggersMissing.yaml': fixtureFile('deploy/deployment_triggersMissing.yaml'),
      'deploy/manifest_dep.yaml': fixtureFile('deploy/manifest_dep.yaml'),
      'deploy/deployment_wrongPackageName.yaml': fixtureFile('deploy/deployment_wrongPackageName.yaml'),
      'deploy/deployment-triggerError.yaml': fixtureFile('deploy/deployment-triggerError.yaml'),
      'deploy/deployment_wrongTrigger.yaml': fixtureFile('deploy/deployment_wrongTrigger.yaml'),
      'deploy/deployment.yaml': fixtureFile('deploy/deployment.yaml'),
      'deploy/deployment_wrongpackage.yaml': fixtureFile('deploy/deployment_wrongpackage.yaml'),
      'deploy/deployment_correctpackage.yaml': fixtureFile('deploy/deployment_correctpackage.yaml'),
      'deploy/deployment.yml': fixtureFile('deploy/deployment.yml'),
      'deploy/deployment_actionMissingInputs.yaml': fixtureFile('deploy/deployment_actionMissingInputs.yaml'),
      'deploy/manifest_dep_Triggers.yaml': fixtureFile('deploy/manifest_dep_Triggers.yaml'),
      'deploy/sequences_missing_actions.yml': fixtureFile('deploy/sequences_missing_actions.yml'),
      'deploy/manifest_triggersRules_NoTrigger.yaml': fixtureFile('deploy/manifest_triggersRules_NoTrigger.yaml'),
      'deploy/manifest_not_present_action.yaml': fixtureFile('deploy/manifest_not_present_action.yaml'),
      'deploy/manifest_zip.yaml': fixtureFile('deploy/manifest_zip.yaml'),
      'deploy/manifest_api.yaml': fixtureFile('deploy/manifest_api.yaml'),
      'deploy/manifest_main.yaml': fixtureFile('deploy/manifest_main.yaml'),
      'deploy/manifest_final.yaml': fixtureFile('deploy/manifest_final.yaml'),
      'deploy/manifest_api_incorrect.yaml': fixtureFile('deploy/manifest_api_incorrect.yaml'),
      'deploy/deployment_syncMissingAction.yaml': fixtureFile('deploy/deployment_syncMissingAction.yaml'),
      'deploy/manifest_multiple_packages.yaml': fixtureFile('deploy/manifest_multiple_packages.yaml'),
      'deploy/manifest.yml': fixtureFile('deploy/manifest.yml'),
      'deploy/wskdeploy_sampleExport.yaml': fixtureFile('deploy/wskdeploy_sampleExport.yaml'),
      'deploy/hello.js': fixtureFile('deploy/hello.js'),
      'deploy/hello_plus.js': fixtureFile('deploy/hello_plus.js'),
      'deploy/main.js': fixtureFile('deploy/main.js'),
      'deploy/app.zip': 'fakezipfile'
    }
    fakeFileSystem.addJson(json)
  })

  afterEach(() => {
    // reset back to normal
    fakeFileSystem.reset()
  })

  describe('run', () => {
    ow.mockResolved('packages.get', '')
    ow.mockResolved('actions.client.options', '')
    ow.actions.client.options = { namespace: 'ns' }
    ow.mockResolved(owRules, '')
    ow.mockResolved(owTriggers, '')
    let hello = fixtureFile('deploy/hello.js')
    let helloPlus = fixtureFile('deploy/hello_plus.js')
    test('exists', async () => {
      expect(command.run).toBeInstanceOf(Function)
    })

    test('manifest.yaml missing', () => {
      const toRemove = [ '/deploy/manifest.yaml' ]
      fakeFileSystem.removeKeys(toRemove)

      ow.mockResolved(owAction, '')
      let cmd = ow.mockResolved(owPackage, '')
      command.argv = [ ]
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({ name: 'demo_package' })
          expect(stdout.output).toMatch('')
        })
    })

    test('deployment.yaml missing as flag', () => {
      const toRemove = [ '/deploy/deployment.yaml' ]
      fakeFileSystem.removeKeys(toRemove)
      let cmd = ow.mockResolved(owPackage, '')
      command.argv = [ '-m', '/deploy/manifest_triggersRules.yaml' ]
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({ name: 'testSeq' })
          expect(stdout.output).toMatch('')
        })
    })

    test('deployment.yml missing as flag', () => {
      const toRemove = [ '/deploy/deployment.yml' ]
      fakeFileSystem.removeKeys(toRemove)
      let cmd = ow.mockResolved(owPackage, '')
      command.argv = [ '-m', '/deploy/manifest_triggersRules.yaml' ]
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({ name: 'testSeq' })
          expect(stdout.output).toMatch('')
        })
    })

    test('deployment.yml and deployment.yaml missing as flags', () => {
      const toRemove = [ '/deploy/deployment.yml' ]
      fakeFileSystem.removeKeys(toRemove)
      const toRemoveFile = [ '/deploy/deployment.yaml' ]
      fakeFileSystem.removeKeys(toRemoveFile)
      let cmd = ow.mockResolved(owPackage, '')
      command.argv = [ '-m', '/deploy/manifest_triggersRules.yaml' ]
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({ name: 'testSeq' })
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys triggers with --deployment flag and deployment.yaml', () => {
      let cmd = ow.mockResolved(owTriggers, '')
      command.argv = ['-m', '/deploy/manifest_dep.yaml', '--deployment', '/deploy/deployment.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({
            name: 'meetPerson',
            trigger: {
              parameters: [
                {
                  key: 'name',
                  value: 'Elrond'
                },
                {
                  key: 'place',
                  value: ''
                },
                {
                  key: 'children',
                  value: 3
                },
                {
                  key: 'height',
                  value: ''
                }
              ]
            }
          })
          expect(stdout.output).toMatch('')
        })
    })

    test('multiple packages should be created even if one package is in common', () => {
      let cmd = ow.mockResolved(owPackage, '')
      command.argv = ['-m', '/deploy/manifest_multiple_packages.yaml', '--deployment', '/deploy/deployment.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledTimes(2)
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys the sample manifest file exported from wskdeploy', () => {
      let cmd = ow.mockResolved(owPackage, '')
      command.argv = ['-m', '/deploy/wskdeploy_sampleExport.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalled()
          expect(stdout.output).toMatch('')
        })
    })

    test('manifest.yml missing', () => {
      const toRemove = [ '/deploy/manifest.yml' ]
      fakeFileSystem.removeKeys(toRemove)

      ow.mockResolved(owAction, '')
      let cmd = ow.mockResolved(owPackage, '')
      command.argv = [ ]
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({ name: 'demo_package' })
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys triggers defined in manifest file', () => {
      ow.mockResolved(owRules, '')
      let cmd = ow.mockResolved(owTriggers, '')
      command.argv = ['-m', '/deploy/manifest_triggersRules.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({
            name: 'meetPerson',
            trigger: {
              parameters: [{
                key: 'name',
                value: 'Elrond'
              },
              {
                key: 'children',
                value: 3
              }
              ]
            }
          })
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys triggers with --deployment flag and deployment.yaml with different package name', () => {
      let cmd = ow.mockResolved(owTriggers, '')
      command.argv = ['-m', '/deploy/manifest_dep.yaml', '--deployment', '/deploy/deployment_wrongpackage.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({
            name: 'meetPerson',
            trigger: {
              parameters: [
                {
                  key: 'name',
                  value: 'Elrond'
                },
                {
                  key: 'place',
                  value: ''
                },
                {
                  key: 'children',
                  value: 3
                },
                {
                  key: 'height',
                  value: ''
                }
              ]
            }
          })
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys actions without deployment inputs with different package name', () => {
      let cmd = ow.mockResolved(owAction, '')
      command.argv = ['-m', '/deploy/manifest_dep.yaml', '--deployment', '/deploy/deployment_wrongpackage.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({
            name: 'testSeq/helloAction',
            action: hello,
            params: { name: '', place: '', children: 0, height: 0 },
            annotations: {
              'raw-http': false,
              'web-export': false
            }
          })
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys actions with main flag and final annotation', () => {
      let cmd = ow.mockResolved(owAction, '')
      let mainAction = fixtureFile('deploy/main.js')
      command.argv = ['-m', '/deploy/manifest_main.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({
            name: 'demo_package/sampleAction',
            action: mainAction,
            params: { name: '', message: '' },
            annotations: {
              'raw-http': false,
              'web-export': false
            },
            exec: {
              'main': 'split'
            }
          })
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys actions with the final annotation', () => {
      let cmd = ow.mockResolved(owAction, '')
      command.argv = ['-m', '/deploy/manifest_final.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({
            name: 'demo_package/anotherAction',
            action: hello,
            annotations: {
              'web-export': true,
              'final': true,
              'raw-http': true,
              'require-whisk-auth': true
            }
          })
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys actions with manifest inputs when no actions present in deployment file', () => {
      let cmd = ow.mockResolved(owAction, '')
      command.argv = ['-m', '/deploy/manifest_dep.yaml', '--deployment', '/deploy/deployment_wrongTrigger.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({
            name: 'testSeq/helloAction',
            action: hello,
            params: { name: '', place: '', children: 0, height: 0 },
            annotations: {
              'raw-http': false,
              'web-export': false
            }
          })
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys triggers with --deployment flag and deployment.yaml with correct package name', () => {
      let cmd = ow.mockResolved(owTriggers, '')
      command.argv = ['-m', '/deploy/manifest_dep.yaml', '--deployment', '/deploy/deployment_correctpackage.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({
            name: 'meetPerson',
            trigger: {
              parameters: [
                {
                  key: 'name',
                  value: 'Elrond'
                },
                {
                  key: 'place',
                  value: ''
                },
                {
                  key: 'children',
                  value: 3
                },
                {
                  key: 'height',
                  value: ''
                }
              ]
            }
          })
          expect(stdout.output).toMatch('')
        })
    })

    test('package should be created if project is the root', () => {
      let cmd = ow.mockResolved(owPackage, '')
      command.argv = ['-m', '/deploy/manifest_report.yaml', '--deployment', '/deploy/deployment.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalled()
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys actions with --deployment flag and deployment.yaml with correct package name', () => {
      let cmd = ow.mockResolved(owAction, '')
      command.argv = ['-m', '/deploy/manifest_dep.yaml', '--deployment', '/deploy/deployment_correctpackage.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({
            name: 'testSeq/helloAction',
            action: hello,
            params: { name: 'Runtime', place: '', children: 0, height: 0 },
            annotations: {
              'raw-http': false,
              'web-export': false
            }
          })
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys actions with manifest content when no input present in deployment file with correct package name', () => {
      let cmd = ow.mockResolved(owAction, '')
      command.argv = ['-m', '/deploy/manifest_dep.yaml', '--deployment', '/deploy/deployment_actionMissingInputs.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({
            name: 'testSeq/helloAction',
            action: hello,
            params: { name: '', place: '', children: 0, height: 0 },
            annotations: {
              'raw-http': false,
              'web-export': false
            }
          })
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys triggers with manifest content when no trigger inputs present in deployment file ', () => {
      let cmd = ow.mockResolved(owTriggers, '')
      command.argv = ['-m', '/deploy/manifest_dep.yaml', '--deployment', '/deploy/deployment_triggersMissingInputs.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({
            name: 'meetPerson',
            trigger: {
              parameters: [
                {
                  key: 'name',
                  value: ''
                },
                {
                  key: 'place',
                  value: ''
                },
                {
                  key: 'children',
                  value: ''
                },
                {
                  key: 'height',
                  value: ''
                }
              ]
            }
          })
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys triggers with manifest content when no triggers present in deployment file ', () => {
      let cmd = ow.mockResolved(owTriggers, '')
      command.argv = ['-m', '/deploy/manifest_dep.yaml', '--deployment', '/deploy/deployment_triggersMissing.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({
            name: 'meetPerson',
            trigger: {
              parameters: [
                {
                  key: 'name',
                  value: ''
                },
                {
                  key: 'place',
                  value: ''
                },
                {
                  key: 'children',
                  value: ''
                },
                {
                  key: 'height',
                  value: ''
                }
              ]
            }
          })
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys rules defined in manifest file', () => {
      let cmd = ow.mockResolved(owRules, '')
      command.argv = ['-m', '/deploy/manifest_triggersRules.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalled()
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys trigger without inputs in manifest file', () => {
      let cmd = ow.mockResolved(owRules, '')
      command.argv = ['-m', '/deploy/manifest_triggersRules_noInputs.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalled()
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys multiple triggers', () => {
      let cmd = ow.mockResolved(owTriggers, '')
      command.argv = ['-m', '/deploy/manifest_dep_Triggers.yaml', '--deployment', '/deploy/deployment.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledTimes(2)
          expect(stdout.output).toMatch('')
        })
    })

    test('errors out on rules not having trigger component', (done) => {
      ow.mockRejected(owRules, '')
      command.argv = ['-m', '/deploy/manifest_triggersRules_NoTrigger.yaml']
      return command.run()
        .then(() => done.fail('does not throw error'))
        .catch((err) => {
          expect(err).toMatchObject(new Error('Failed to deploy: Trigger and Action are both required for rule creation'))
          done()
        })
    })

    test('errors out on rules having incorrect action name', (done) => {
      ow.mockRejected(owRules, '')
      command.argv = ['-m', '/deploy/manifest_triggersRules_IncorrectAction.yaml']
      return command.run()
        .then(() => done.fail('does not throw error'))
        .catch((err) => {
          expect(err).toMatchObject(new Error('Failed to deploy: Action/Trigger provided in the rule not found in manifest file'))
          done()
        })
    })

    test('deploys a package with path to manifest.yaml', () => {
      ow.mockResolved(owAction, '')
      let cmd = ow.mockResolved(owPackage, '')
      command.argv = ['-m', '/deploy/manifest.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({ name: 'demo_package' })
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys a package with manifest.yml', () => {
      let cmd = ow.mockResolved(owPackage, '')
      command.argv = ['-m', '/deploy/manifest.yml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({ name: 'demo_package' })
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys actions defined in manifest.yml', () => {
      let cmd = ow.mockResolved(owAction, '')
      command.argv = ['-m', '/deploy/manifest.yml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledTimes(5)
          expect(stdout.output).toMatch('')
        })
    })

    test('deploy a simple api', () => {
      let cmd = ow.mockResolved(owAPI, '')
      command.argv = ['-m', '/deploy/manifest_api.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({
            basepath: '/hello',
            name: 'hello-world',
            relpath: '/world',
            operation: 'get',
            responsetype: 'json', // the default
            action: 'testAPI/hello_world'
          })
        })
    })

    test('web sequence in yaml file should create a web sequence action', () => {
      let cmd = ow.mockResolved(owAction, '')
      command.argv = [ '-m', '/deploy/manifest_webSequence.yaml' ]
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledTimes(4)
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys actions defined in manifest.yaml', () => {
      let cmd = ow.mockResolved(owAction, '')
      command.argv = ['-m', '/deploy/manifest.yaml']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({ name: 'demo_package/sampleAction', action: hello, annotations: { 'web-export': false, 'raw-http': false }, params: { name: 'Adobe', message: 'Demo' } })
          expect(cmd).toHaveBeenCalledWith({ name: 'demo_package/anotherAction', action: helloPlus, annotations: { 'web-export': false, 'raw-http': false } })
          expect(cmd).toHaveBeenCalledTimes(2)
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys actions with --param flags defined in manifest.yaml', () => {
      let cmd = ow.mockResolved(owAction, '')
      command.argv = ['-m', '/deploy/manifest.yaml', '--param', 'name', 'Runtime', '--param', 'message', 'Deploy']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({ name: 'demo_package/sampleAction', action: hello, annotations: { 'web-export': false, 'raw-http': false }, params: { name: 'Runtime', message: 'Deploy' } })
          expect(cmd).toHaveBeenCalledTimes(2)
          expect(stdout.output).toMatch('')
        })
    })

    test('deploys actions with --param-file flags defined in manifest.yaml', () => {
      let cmd = ow.mockResolved(owAction, '')
      command.argv = ['-m', '/deploy/manifest.yaml', '--param-file', '/deploy/parameters.json']
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledWith({ name: 'demo_package/sampleAction', action: hello, annotations: { 'web-export': false, 'raw-http': false }, params: { name: 'param1value', message: 'Demo' } })
          expect(cmd).toHaveBeenCalledTimes(2)
          expect(stdout.output).toMatch('')
        })
    })

    test('errors out on deploying zip without runtime flag error', (done) => {
      ow.mockRejected(owAction, new Error('an error'))
      command.argv = ['-m', '/deploy/manifest_zip.yaml']
      return command.run()
        .then(() => done.fail('does not throw error'))
        .catch((err) => {
          expect(err).toMatchObject(new Error('Failed to deploy: Invalid or missing runtime in the manifest for this action: demo_package/sampleAction'))
          done()
        })
    })

    test('errors out on deploying API without arguments', (done) => {
      ow.mockRejected(owAPI, '')
      command.argv = ['-m', '/deploy/manifest_api_incorrect.yaml']
      return command.run()
        .then(() => done.fail('does not throw error'))
        .catch((err) => {
          expect(err).toMatchObject(new Error('Failed to deploy: Arguments to create API not provided'))
          done()
        })
    })

    test('both manifest files not found', (done) => {
      const toRemove = [ '/deploy/manifest.yaml', '/deploy/manifest.yml' ]
      fakeFileSystem.removeKeys(toRemove)

      ow.mockRejected(owAction, new Error('an error'))
      command.argv = [ ]
      return command.run()
        .then(() => done.fail('does not throw error'))
        .catch((err) => {
          expect(err).toMatchObject(new Error('Failed to deploy: Manifest file not found'))
          done()
        })
    })

    test('sequences in yml file should create a sequence action', () => {
      let cmd = ow.mockResolved(owAction, '')
      command.argv = [ '-m', '/deploy/sequences_implemented.yml' ]
      return command.run()
        .then(() => {
          expect(cmd).toHaveBeenCalledTimes(4)
          expect(stdout.output).toMatch('')
        })
    })

    test('sequences should throw an error when no actions are provided', (done) => {
      ow.mockRejected(owAction, new Error('an error'))
      command.argv = [ '-m', '/deploy/sequences_missing_actions.yml' ]
      return command.run()
        .then(() => done.fail('does not throw error'))
        .catch((err) => {
          expect(err).toMatchObject(new Error('Failed to deploy: Actions for the sequence not provided.'))
          done()
        })
    })

    test('error should be thrown when sequence action mentioned in api is not a web action ', (done) => {
      ow.mockRejected(owAction, new Error('an error'))
      command.argv = [ '-m', '/deploy/manifest_not_webAction.yaml' ]
      return command.run()
        .then(() => done.fail('does not throw error'))
        .catch((err) => {
          expect(err).toMatchObject(new Error('Failed to deploy: Action provided in api is not a web action'))
          done()
        })
    })

    test('error should be thrown when sequence in api is not a web sequence action', (done) => {
      ow.mockRejected(owAction, new Error('an error'))
      command.argv = [ '-m', '/deploy/manifest_not_webSequence.yaml' ]
      return command.run()
        .then(() => done.fail('does not throw error'))
        .catch((err) => {
          expect(err).toMatchObject(new Error('Failed to deploy: Sequence provided in api is not a web action'))
          done()
        })
    })

    test('project name different in manifest and deployment file', (done) => {
      command.argv = [ '-m', '/deploy/deployment_syncMissingAction.yaml', '-d', '/deploy/deployment.yml' ]
      return command.run()
        .then(() => done.fail('does not throw error'))
        .catch((err) => {
          expect(err).toMatchObject(new Error('Failed to deploy: The project name in the deployment file does not match the project name in the manifest file'))
          done()
        })
    })

    test('error should be thrown when action in api is not present in the package', (done) => {
      ow.mockRejected(owAction, new Error('an error'))
      command.argv = [ '-m', '/deploy/manifest_not_present_action.yaml' ]
      return command.run()
        .then(() => done.fail('does not throw error'))
        .catch((err) => {
          expect(err).toMatchObject(new Error('Failed to deploy: Action provided in the api not present in the package'))
          done()
        })
    })
  })
})
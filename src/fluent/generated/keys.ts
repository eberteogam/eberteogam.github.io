import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: '5e4b86b70c244c4db07ee202259cdf8d'
                    }
                    br0: {
                        table: 'sys_script'
                        id: '43466dd87efe4f1985c843d5d85faeed'
                    }
                    cs0: {
                        table: 'sys_script_client'
                        id: 'fb125ed3a2f848f28573336b359fe5b2'
                    }
                    'lodash.snakecase@4.1.1/index.js': {
                        table: 'sys_module'
                        id: '1f0f4e5caa6f45a9a1d013f15ebc189a'
                        deleted: true
                    }
                    'lodash.snakecase@4.1.1/package.json': {
                        table: 'sys_module'
                        id: 'ccb1f60c775a495196b0779c2a79e00c'
                        deleted: true
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '4d6f4b53f12c43c1b9f24481cf487fa0'
                    }
                    src_server_script_ts: {
                        table: 'sys_module'
                        id: 'd3d2627689e04aad9fa35a53223f4d7e'
                    }
                }
            }
        }
    }
}

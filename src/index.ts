import * as aiven from '@pulumi/aiven';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';

async function main() {
    const randomStr = new random.RandomString('random-string', {
      length: 5,
      special: false,
      upper: false,
      number: false
    });

    // Setup your aiven:apiToken

    const project = new aiven.Project('project', {
      project: pulumi.interpolate`import-test-${randomStr.result}`,
    });

    // Add payment method manually to the project. Otherwise db creation will fail 

    // STAGE 1
    // Generate stack.1.json
    const postgres = new aiven.Pg('postgres', {
      project: project.project,
      serviceName: pulumi.interpolate`postgres-${randomStr.result}`,
      plan: 'hobbyist',
      cloudName: 'do-nyc'
    });

    // STAGE 2
    // Export state, remove postgres from it and import it back. Comment initial postgres and uncomment this one below.
    // Generate stack.2.json
    // See that it contains unprotected values.
    // randomStr.result.apply(x => {
    //   const postgres = new aiven.Pg('postgres', {
    //     project: project.project,
    //     serviceName: pulumi.interpolate`postgres-${randomStr.result}`,
    //     plan: 'hobbyist',
    //     cloudName: 'do-nyc'
    //   },
    //   {
    //     import: `import-test-${x}/postgres-${x}`
    //   });
    // });


    // STAGE 3
    // Remove postgres from state again and try to import  
    // Generate stack.3.json
    // See that it still contains unprotected values for:
    // pg.password
    // pg.replicaUri
    // pg.uri
    // pgUserConfig.adminPassword
    // randomStr.result.apply(x => {
    //   const postgres = new aiven.Pg('postgres', {
    //     project: project.project,
    //     serviceName: pulumi.interpolate`postgres-${randomStr.result}`,
    //     plan: 'hobbyist',
    //     cloudName: 'do-nyc'
    //   },
    //   {
    //     import: `import-test-${x}/postgres-${x}`,
    //     additionalSecretOutputs: [
    //       'pg.password',
    //       'pg.replicaUri',
    //       'pg.uri',
    //       'pgUserConfig.adminPassword',
    //       'servicePassword',
    //       'serviceUri',
    //     ],
    //   });
    // });
}

main();
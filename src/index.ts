import * as aiven from '@pulumi/aiven';
import * as pulumi from '@pulumi/pulumi';
import * as azure_native from '@pulumi/azure-native';


async function main() {
    const CONFIG = new pulumi.Config();

    // const provider = new aiven.Provider('timescale', {
    //     apiToken: CONFIG.require('timescaleToken'),
    //   });

    // const integration = await aiven.getServiceIntegrationEndpoint({
    //   project: 'mapped-timescale',
    //   endpointName: 'datadog-timescale-db',
    // }, {
    //   provider: provider
    // });

    // return integration.id;

    const aivenVpcProject = await aiven.getProjectVpc({
      project: 'myproject142342',
      cloudName: 'azure-westus2',
    });

    const aivenVnetPeering = new aiven.VpcPeeringConnection(
      'aiven-peering-connection',
      {
        vpcId: aivenVpcProject.id,
        peerVpc: 'test-vnet',
        peerCloudAccount: 'a4c0d722-5616-4a4e-a6f1-636d9794a254',
        peerAzureTenantId: 'cca924b4-1b57-455f-97fc-8a315cb8c4ea',
        peerResourceGroup: 'test',
        peerAzureAppId: '916a6c3e-dc99-4434-bf54-e3d893216024',
      }
    );

    const aivenProvider = new azure_native.Provider('aiven-provider', {
      auxiliaryTenantIds: [aivenVnetPeering.stateInfo['to-tenant-id'] as pulumi.Output<string>]
    });

    const vnet = await azure_native.network.getVirtualNetwork({
      virtualNetworkName: 'test-vnet',
      resourceGroupName: 'test'
    });

    const mappedVnetPeering = new azure_native.network.VirtualNetworkPeering(
    'aiven-network-peering',
    {
      allowForwardedTraffic: false,
      allowGatewayTransit: false,
      allowVirtualNetworkAccess: true,
      remoteVirtualNetwork: {
        id: aivenVnetPeering.stateInfo['to-network-id'] as pulumi.Output<string>,
      },
      resourceGroupName: 'test',
      useRemoteGateways: false,
      virtualNetworkName: vnet.name,
      virtualNetworkPeeringName: 'aiven-network-peering',
    },
    {
      provider: aivenProvider,
    }
  );
}

main();
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as Iam from 'aws-cdk-lib/aws-iam';


// Props
interface EC2StackProps extends cdk.StackProps {
    ec2Role: Iam.Role;
    vpc: ec2.Vpc; //Role for EC2 instance to access AWS services
    }

export class EC2Stack extends cdk.Stack {

// Export security group for RDS stack

    public readonly ec2SecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: EC2StackProps) {
    super(scope, id, props);

        // Security Group for EC2 instances

        this.ec2SecurityGroup = new ec2.SecurityGroup(this, 'EC2SecurityGroup', {
            vpc: props.vpc,
            description: 'Security Group for EC2 Instance',
            allowAllOutbound: true,
        });

        // Allows inbound SSH traffic from any IPv4 to EC2 instances
    
        
        this.ec2SecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(), 
            ec2.Port.tcp(22), // SSH port
            'Allow SSH access from from any IPv4 address'
        );

        // Allows inbound HTTP traffic from any IPv4 to EC2 instances

        this.ec2SecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(80), // HTTP port
            'Allow HTTP access from any IPv4 address'
        );

        cdk.Tags.of(this.ec2SecurityGroup).add('Name', 'Public-EC2-SG');

// EC2 Instance for AZ1

const ec2InstanceAZ1 = new ec2.Instance(this, 'PulseLogicEC2-AZ1', {
    vpc: props.vpc,
    vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
        },
        machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
    }),
       instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
    })

        cdk.Tags.of(ec2InstanceAZ1).add('Name', 'PulseLogicEC2-AZ1');
        
        // EC2 instance in AZ2

        const ec2InstanceAZ2 = new ec2.Instance(this, 'PulseLogicEC2-AZ2', {
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC,
                availabilityZones: [props.vpc.availabilityZones[1]], 
            },
            machineImage: new ec2.AmazonLinuxImage({
                generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            }),
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO), 
            securityGroup: this.ec2SecurityGroup, 
            role: props.ec2Role, 

        });   
        
        cdk.Tags.of(ec2InstanceAZ2).add('Name', 'PulseLogicEC2-AZ2');
      }
    }
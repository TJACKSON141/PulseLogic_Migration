import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface IAMStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;
    appName: string;
}
// IAM Stack for creating the roles and policies

export class IAMStack extends cdk.Stack {

    public readonly ec2Role: iam.Role;

    constructor(scope: Construct, id: string, props: IAMStackProps) {
        super(scope, id, props);

        // IAM Role for the EC2 instances

        this.ec2Role = new iam.Role(this, 'PuleLogicEC2Role', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
            roleName: 'PulseLogicEC2Role', 
            description: "Role for the EC2 instances to access AWS services"
        });

        // Allows for the EC2 instance to access AWS Systems Manager (SSM)

        this.ec2Role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));

    }
}
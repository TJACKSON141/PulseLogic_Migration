#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { IAMStack } from '../lib/constructs/iam/iam-stack';
import { VPCStack } from '../lib/constructs/vpc/vpc-stack';
import { EC2Stack } from '../lib/constructs/ec2/ec2-stack';
import { RDSStack } from '../lib/constructs/rds/rds-stack';

const app = new cdk.App();

// Creates VPC stack
const vpcStack = new VPCStack(app, 'VPCStack');

// Creates IAM stack and export the EC2 role
const iamStack = new IAMStack(app, 'IamStack', {
  vpc: vpcStack.vpc,
  appName: 'PulseLogic',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

// Creates EC2 stack, passing VPC and EC2 role from previous stacks
const ec2Stack = new EC2Stack(app, 'EC2Stack', {
  vpc: vpcStack.vpc,
  ec2Role: iamStack.ec2Role, // Make sure IAMStack exports ec2Role
});

// Creates RDS stack, passing VPC and EC2 security group from the previous stacks
new RDSStack(app, 'RDSStack', {
  vpc: vpcStack.vpc,
  ec2SecurityGroup: ec2Stack.ec2SecurityGroup, // Esnures the EC2Stack exports ec2SecurityGroup
});

app.synth();
# **PulseLogic Infrastructure Modernisation with AWS CDK**

Migrating from manually managed AWS infrastructure to a fully automated Infrastructure as Code (IaC) setup using AWS CDK (TypeScript), improving security, scalability, and compliance for healthcare operations.

---

## 📖 **Overview**

PulseLogic’s patient portal infrastructure was previously built and managed manually through the AWS Management Console. While functional, this approach made security hard to enforce consistently, slowed down deployments, and increased the risk of misconfigurations.

I re-engineered the environment using **AWS CDK** with **TypeScript**, applying best practices such as version control, peer review, and modular design. The result is a **secure, scalable, and compliance-ready architecture** that can be deployed to multiple environments in minutes instead of hours.

---

## **The Problem**

- **Manual builds: A**ll infrastructure created through AWS Console, no version control
- **Hard to replicate:** Inconsistent environments and no change tracking
- **No automation:** No testing pipelines or reliable documentation
- **Weak network security:** All resources in public subnets, no proper segmentation
- **Manual security rules:** Security groups set up ad-hoc with no clear structure
- **Messy AZ usage:** Resources spread across multiple availability zones without clear organisation

**Previous Setup:**

- **EC2 (public subnets):** Hosted the patient portal web app
- **MySQL RDS (public subnets):**  Patient data exposed to the internet
- **No IaC or change management:** Risky and hard to maintain

## **The Solution**

- **Rebuilt with AWS CDK (TypeScript):** Full automation and version control
- **Proper VPC segmentation:** Public subnets for web, private subnets for database
- **Credential security:** Automated management via AWS Secrets Manager
- **Compliance-ready:** Architecture aligned with AWS security best practices
- **Easily replicable:** Modular stacks for dev, staging, and production

---

## **🏗️ Project Architecture**

![PulseLogic AWS Migration Solution](PulseLogic%20Architecture.JPEG)

---

## 🏥 **Value for the Organisation**

- **Security & Compliance**: Patient data stored in private subnets with no internet exposure, IAM least privilege, and credential rotation via Secrets Manager
- **Operational Efficiency**: Infrastructure can be deployed or updated in minutes using automated pipelines
- **Audit-ability**: All changes are tracked in version control for easier compliance reporting
- **Scalability**: Modular CDK design allows safe and fast expansion of services
- **Resilience**: Built-in Multi-AZ design ensures high availability for patient-facing services
- **Cost Control**: Resource configurations optimised to meet compliance while avoiding unnecessary spend

---

## 🛡️ Security Features

### Network Security

- **Private Subnets**: RDS instances isolated from internet access
- **Security Groups**: Minimal privilege access policies
- **No SSH**: SSH access removed for enhanced security

### Access Management

- **IAM Roles**: EC2 instances utilise roles rather than access keys
- **Session Manager**: Secure shell access eliminating SSH requirements
- **Secrets Manager**: Automatic credential management with rotation

### Compliance

- **Audit Trail**: Infrastructure changes tracked via git
- **Reproducible**: Consistent environments using IaC
- **Healthcare Ready**: Built for HIPAA compliance standards

---

## 📋 **Prerequisites**

Before you start, make sure the following and installed and configured:

**Required Software**

- Node.js (v16 or later)
- AWS CDK CLI (`npm install -g aws-cdk`)
- AWS CLI (v2.x)
- Git - For version control

**AWS Setup**

- AWS account with permissions for EC2, RDS, VPC, IAM, Secrets Manager, CloudWatch, and SSM
- AWS CLI configured (`aws configure`)
- CDK bootstrapped in target account/region (`cdk bootstrap`)
- 

**Required Permissions**

Your AWS user needs permissions for:

- RDS (Database instances, Subnet groups)
- IAM (Roles, Policies)
- EC2 (VPC, Security Groups, Instances)
- Secrets Manager
- CloudFormation

---

## 🚀 **Quick Start**

**1. Clone & Install**

```bash
bash
CopyEdit
# Clone the repo
git clone <your-repo-url>
cd PulseLogic_Migration

# Install dependencies
npm install

# Check AWS CDK is installed
cdk --version
```

**2. Configure AWS**

```bash
bash
CopyEdit
# Set up AWS credentials
aws configure

# Set default region (example: eu-west-1)
export AWS_DEFAULT_REGION=eu-west-1

# Bootstrap CDK (one-time per region)
cdk bootstrap
```

**3. Review & Deploy**

```bash
bash
CopyEdit
# Preview changes before deploying
cdk diff

# Deploy the stack
cdk deploy TechhealthMigrationStack
```

*Follow prompts and confirm deployment.*

**4. Verify Deployment**

Once deployed, you’ll get output values including:

- **RDSEndpoint** — database connection URL
- **RDSSecretArn** — ARN of credentials stored securely in AWS Secrets Manager

```bash
bash
CopyEdit
cdk diff
cdk deplo
```

---

## Stack Parameters

The PulseLogic stack includes these configurable options (modify in the code):

- **VPC CIDR**: Default cidrMask /24
- **Instance Types**: EC2 t3.micro, RDS db.t3.micro
- **Database Storage**: 20 GB allocated storage
- **Database Engine**: MySQL 8.0

---

## 🔗 Accessing The Infrastructure

### Connect to EC2 Instances

```bash
*# List the EC2 instances*
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,Tags[?Key==`Name`].Value|[0],State.Name]' --output table

*# Connect via Session Manager (no SSH required)*
aws ssm start-session --target i-1234567890abcdef0
```

### Access Database Credentials

```bash
*# Get the secret ARN from stack outputs*
aws cloudformation describe-stacks --stack-name PulseLogicStack --query 'Stacks[0].Outputs'

*# Retrieve database credentials*
aws secretsmanager get-secret-value --secret-id pulselogic/rds/credentials
```

### Connect to RDS

From your EC2 instance, you can connect to RDS using:

```bash
*# Install MySQL client*
sudo yum update -y
sudo yum install mysql -y

*# Get credentials from Secrets Manager*
SECRET=$(aws secretsmanager get-secret-value --secret-id pulselogic/rds/credentials --query SecretString --output text)
USERNAME=$(echo $SECRET | jq -r .username)
PASSWORD=$(echo $SECRET | jq -r .password)
ENDPOINT="<RDS_ENDPOINT_FROM_OUTPUTS>"

*# Connect to database*
mysql -h $ENDPOINT -u $USERNAME -p$PASSWORD
```

---

## 🧪 Testing

### Connectivity Testing

- **EC2 to RDS**: Verify MySQL connection from EC2 to RDS - test script available in helper-scripts folder
- **Security Groups**: Confirm only authorised traffic is allowed
- **Network Isolation**: Ensure RDS has no internet access
- **Session Manager**: Test secure access to EC2 instances

---

## 💰 Cost Considerations

### Current Configuration Costs (approximate)

- **EC2 t3.micro**: ~$8.50/month (free tier eligible)
- **RDS db.t3.micro**: ~$15/month (20GB storage)
- **VPC**: No additional cost
- **Secrets Manager**: ~$0.40/month per secret
- **Session Manager**: No additional cost

### Cost Optimisation Tips

- Use free tier resources where possible
- Destroy development environments when not in use
- Monitor usage with AWS Cost Explorer
- Set up billing alerts

---

## 🗑️ Cleanup

To avoid ongoing charges, destroy the stack when no longer needed:

```bash
*# Destroy all resources*
cdk destroy PulseLogicStack

*# Confirm deletion when prompted*
```

⚠️ **Warning**: This will permanently delete all resources, including the RDS database. Ensure you have backups if needed.

---

## 🐛 Troubleshooting

### Common Issues

### CDK Bootstrap Error

```bash
*# Re-run bootstrap with explicit region*
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

### Permission Denied

- Verify your AWS credentials have necessary permissions
- Check IAM policies for EC2, RDS, and CloudFormation access

### RDS Connection Issues

- Verify security group rules allow traffic from EC2
- Check RDS endpoint and port (3306 for MySQL)
- Ensure credentials are correctly retrieved from Secrets Manager

### Session Manager Connection Failed

- Verify EC2 instance has SSM agent installed and running
- Check IAM role has AmazonSSMManagedInstanceCore policy
- Ensure instance is in running state

### Useful Commands

```bash
*# View stack resources*
aws cloudformation describe-stack-resources --stack-name PulseLogicStack

*# Check CDK version*
cdk --version

*# View available CDK commands*
cdk --help

*# Check AWS CLI configuration*
aws configure list
```
